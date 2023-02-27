const config = require('../config.json');
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const HashMap = require ('hashmap');
var redis = require('redis');
const { promisify } = require("util");

/* DB Query 및 DAO */
const SQL = require("../models/SQL.Script");
const ERROR = require("../models/Error");
const { QueryTypes } = require('sequelize');

/* 모델 */
const DB = require("../models");

module.exports = {
  token,
  refresh,
  logout,
};

const client = redis.createClient({
  host : "192.168.150.102",
  port : 6379
});

const getAsync = promisify(client.get).bind(client);

client.on("error", function (err) {
  console.log("Error " + err);
});

class UserToken {
  constructor(accessToken, refreshToken) {
    this.accessToken = accessToken;
    if (refreshToken != null || refreshToken != undefined) {
        this.refreshToken = refreshToken;
    }
  }
}

async function token({ username, password }, req, res) {
  var accessToken = '';
  var refreshToken = '';
  
  try {
    const user = await DB.sequelize.query(SQL.USER_FIND, {
      type: QueryTypes.SELECT, 
      model: DB.User,
      replacements: { 
        email: username,
        password: md5(password)
      }
    }).then(function (data) {
      if (data.length <= 0) {
          return null;
      }
      return data[0];
    });
  
    if (user == null) {
        res.status(404);
        return { error: ERROR.NOT_FOUND_USER };
    } else {
      var user_id = 'USER_' + String(user.idx);
      
      let token = await getAsync(user_id);
      if (token != null) {
        client.del(user_id);
      }
      
      // 발급
      accessToken = jwt.sign({ iss: "localhost", code: user.idx }, config.secret, { expiresIn: config.token_expire_time });
      refreshToken = jwt.sign({ code: user.idx }, config.secret, { expiresIn: config.refresh_expire_time });
      
      // 로그인 기록
      await DB.sequelize.query(SQL.USER_INSERT_LOG, {
        type: QueryTypes.INSERT, replacements: { 
          account_id: user.idx,
          user_ip: req.clientIp,
          email: username
        }
      }).then(function (data) {
      });
      
      // 방문 이력 변경
      var visit_plus = user.visit + 1;
      await DB.sequelize.query(SQL.USER_UPDATE_VISIT, {
        type: QueryTypes.UPDATE, replacements: { 
          account_id: user.idx,
          visit_plus: visit_plus
        }
      }).then(function (data) {
      });
      
      let new_token = new UserToken(accessToken, refreshToken);
      client.set(user_id, JSON.stringify(new_token));
      client.expire(user_id, config.redis_token_expired);
    }
    
  } catch (error) {
      console.log(error);
  }
  
  return new UserToken(accessToken, refreshToken);
}

// 정상적인 refresh 토큰이 아니면 모든 오류는 400으로 오류 처리한다.
async function refresh(req, res) {
  var accessToken = '';
  
  try {
    // refresh 토큰이 만료되었는지 확인한다. 만료되지 않은 경우 user id를 획득하여 access token에 반영한다.
    // 만약 만료되었을 경우는 로그아웃 처리한다.
    var payload = jwt.verify(req.body.refreshToken, config.secret);
    
    var user_id = 'USER_' + String(payload.code);
    let token = await getAsync(user_id);
    if (token == null || token == undefined) {
      // 토큰이 만료되었으니, 로그인하도록 한다.
      console.log("로그인이 안되어 있거나, 만료되어서 Redis에서 삭제됨");
      res.status(401);
      return { error: ERROR.DO_NOT_LOGGED_IN };
    }
    
    let jsonToken = JSON.parse(token);
    
    // Memory DB와 요청값이 동일해야만 처리된다.
    // 만약 다르면 로그아웃 처리되어야 한다.
    // refresh 토큰이 유지되는 동안만 재발급하여 처리해준다.
    if (jsonToken.refreshToken != req.body.refreshToken) {
      console.log("리플리쉬 토큰이 다르다. 다른곳에서 로그인함");
      res.status(403);
      return { error: ERROR.DO_NOT_MATCHING_TOKEN };
    }
    
    // 3초 짧은 시간내에 재발급이 실행된 경우는 재발급하지 않는다.
    const object = jwt.decode(jsonToken.accessToken);
    var current_time = Math.round(+new Date()/1000);
    if (object.iat >= (current_time - 60)) {
      // 원래 있던 Access Token으로 발급해준다.
      return new UserToken(jsonToken.accessToken, null);
    }
    
    // 새롭게 발급한다.
    accessToken = jwt.sign({ iss: "worldpop.co.nz", code: payload.code, discount: object.discount }, config.secret, { expiresIn: config.token_expire_time });
    token.accessToken = accessToken;
    
    // 새로 발급된 토큰을 Redis에 갱신한다.
    let new_token = new UserToken(accessToken, req.body.refreshToken);
    client.set(user_id, JSON.stringify(new_token));
  } catch (error) {
    console.log(error);
    
    // jwt expired 로 ERROR 처리가 되면 로그아웃 처리하도록 응답한다.
    if (error.message == 'jwt expired') {
      var payload = jwt.decode(req.body.refreshToken, config.secret);
      
      var user_id = 'USER_' + String(payload.code);
      let token = getAsync(user_id);
      if (token == null || token == undefined) {
        client.del(user_id);
      }
      
      // 로그아웃 처리하기 위해 400으로 응답함.
      res.status(401);
      return { error: error.message };
    } else {
      res.status(500);
      return { error: error.message };
    }
  }
  
  return new UserToken(accessToken, null);
}

async function logout(req, res) {
  var authHeader = req.headers.authorization;
  const accessToken = authHeader && authHeader.split(' ')[1];    
  const object = jwt.decode(accessToken);
  
  // 중복 로그인의 경우, 로그아웃 했을 경우 나중 로그인 한 사람의 토큰이 없어져 버린다. 
  // 다라서 이 부분은 삭제 하지 않도록 한다.
  // Access 토큰이 다르면 Redis 내에 데이터는 삭제하지 않고 로그아웃 처리한다.
  var user_id = 'USER_' + String(object.code);
  let token = await getAsync(user_id);
  if (token != null || token != undefined) {
    if (token.accessToken == accessToken) {
      return;
    }
  }
  
  try {
    client.del(user_id);
  } catch (error) {
    console.log(error);
  }
}

/*
async function getAll() {
    return {
        ...omitPassword(user),
        accessToken,
        refreshToken
    };
    
    return users.map(u => omitPassword(u));
}

function omitPassword(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}
*/
