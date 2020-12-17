const Sequelize = require("sequelize");
module.exports = class Domain extends (
  Sequelize.Model
) {
  static init(sequelize) {
    return super.init(
      {
        host: {
          type: Sequelize.STRING(80),
          allowNull: false,
        },
        type: {
          type: Sequelize.ENUM("free", "premium"),
          allowNull: false,
        },
        serverSecret: {
          type: Sequelize.STRING(36),
          allowNull: false,
        },
        frontSecret: {
          type: Sequelize.STRING(36),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: "Domain",
        tableName: "domains",
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }
  static associate(db) {
    db.Domain.belongsTo(db.User);
  }
};
