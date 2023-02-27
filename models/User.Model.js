module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        idx: {
            type: Sequelize.BIGINT,
            unique: true,
            allowNull: false,
            primaryKey: true,
        },
        company: {
            type: Sequelize.STRING,
            unique: false,
            allowNull: false
        },
        lastname: {
            type: Sequelize.STRING
        },
        firstname: {
            type: Sequelize.STRING
        },
        tel: {
            type: Sequelize.STRING
        },
        mobile: {
            type: Sequelize.STRING
        },
        fax: {
            type: Sequelize.STRING
        },
        address1: {
            type: Sequelize.STRING
        },
        address2: {
            type: Sequelize.STRING
        },
        city: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        discount: {
            type: Sequelize.DOUBLE
        },
        visit: {
            type: Sequelize.BIGINT
        },
        last_visit: {
            type: Sequelize.DATE
        },
        register: {
            type: Sequelize.DATE
        }
    });

    return User;
};
  