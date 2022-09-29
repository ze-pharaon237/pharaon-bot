"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const config_1 = __importDefault(require("../config"));
const sequelize_1 = require("sequelize");
const sequelize = config_1.default.DATABASE;
class Auth extends sequelize_1.Model {
}
exports.Auth = Auth;
Auth.init({
    key: {
        type: sequelize_1.DataTypes.STRING(1000000),
        allowNull: false,
    },
    value: {
        type: sequelize_1.DataTypes.STRING(1000000)
    },
    type: {
        type: sequelize_1.DataTypes.STRING(1000000),
    }
}, {
    sequelize,
    tableName: "Authentication",
    timestamps: false,
});
//# sourceMappingURL=auth.js.map