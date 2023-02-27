module.exports = {
    USER_FIND: "SELECT * FROM accounts WHERE email = :email AND password = :password",
    USER_INSERT_LOG: "INSERT INTO `accounts_log` (`account_id`, `ip` , `email`) VALUES (:account_id , :user_ip, :email)",
    USER_UPDATE_VISIT: "UPDATE `accounts` SET `visit`= :visit_plus, `last_visit` = now() WHERE `idx` = :account_id",
}
