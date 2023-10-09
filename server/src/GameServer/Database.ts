import {
    Association,
    BelongsToCreateAssociationMixin,
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    CreationOptional,
    DataTypes,
    ForeignKey,
    HasManyAddAssociationMixin,
    HasManyAddAssociationsMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyHasAssociationMixin,
    HasManyHasAssociationsMixin,
    HasManyRemoveAssociationMixin,
    HasManyRemoveAssociationsMixin,
    HasManySetAssociationsMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize,
} from "sequelize";

import {Color, GameResolution} from "@/GameServer/DataModel.js";

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "db.sqlite",
    logging: false,
    define: {
        freezeTableName: true,
    },
});

export class UserProfile extends Model<InferAttributes<UserProfile>, InferCreationAttributes<UserProfile>> {
    declare id: number;
    declare fullName: string;
    declare username: string | null;
    declare languageCode: string | null;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare getWhiteGames: HasManyGetAssociationsMixin<PlayedGame>;
    declare addWhiteGame: HasManyAddAssociationMixin<PlayedGame, string>;
    declare addWhiteGames: HasManyAddAssociationsMixin<PlayedGame, string>;
    declare setWhiteGames: HasManySetAssociationsMixin<PlayedGame, string>;
    declare removeWhiteGame: HasManyRemoveAssociationMixin<PlayedGame, string>;
    declare removeWhiteGames: HasManyRemoveAssociationsMixin<PlayedGame, string>;
    declare hasWhiteGame: HasManyHasAssociationMixin<PlayedGame, string>;
    declare hasWhiteGames: HasManyHasAssociationsMixin<PlayedGame, string>;
    declare countWhiteGames: HasManyCountAssociationsMixin;
    declare createWhiteGame: HasManyCreateAssociationMixin<PlayedGame, "whitePlayerID">;

    declare getBlackGames: HasManyGetAssociationsMixin<PlayedGame>;
    declare addBlackGame: HasManyAddAssociationMixin<PlayedGame, string>;
    declare addBlackGames: HasManyAddAssociationsMixin<PlayedGame, string>;
    declare setBlackGames: HasManySetAssociationsMixin<PlayedGame, string>;
    declare removeBlackGame: HasManyRemoveAssociationMixin<PlayedGame, string>;
    declare removeBlackGames: HasManyRemoveAssociationsMixin<PlayedGame, string>;
    declare hasBlackGame: HasManyHasAssociationMixin<PlayedGame, string>;
    declare hasBlackGames: HasManyHasAssociationsMixin<PlayedGame, string>;
    declare countBlackGames: HasManyCountAssociationsMixin;
    declare createBlackGame: HasManyCreateAssociationMixin<PlayedGame, "blackPlayerID">;

    declare static associations: {
        whiteGames: Association<UserProfile, PlayedGame>;
        blackGames: Association<UserProfile, PlayedGame>;
    };
}

UserProfile.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        languageCode: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {sequelize}
);

export class PlayedGame extends Model<InferAttributes<PlayedGame>, InferCreationAttributes<PlayedGame>> {
    declare id: string;
    declare timerEnabled: boolean;
    declare timerInit: number;
    declare timerIncrement: number;
    declare pgn: string;
    declare resolution: GameResolution;
    declare winner: Color | null;

    declare createdAt: CreationOptional<Date>;

    declare whitePlayerID: ForeignKey<UserProfile["id"]>;
    declare blackPlayerID: ForeignKey<UserProfile["id"]>;

    declare getWhitePlayer: BelongsToGetAssociationMixin<UserProfile>;
    declare setWhitePlayer: BelongsToSetAssociationMixin<UserProfile, number>;
    declare createWhitePlayer: BelongsToCreateAssociationMixin<UserProfile>;

    declare getBlackPlayer: BelongsToGetAssociationMixin<UserProfile>;
    declare setBlackPlayer: BelongsToSetAssociationMixin<UserProfile, number>;
    declare createBlackPlayer: BelongsToCreateAssociationMixin<UserProfile>;

    declare static associations: {
        whitePlayer: Association<PlayedGame, UserProfile>;
        blackPlayer: Association<PlayedGame, UserProfile>;
    };
}

PlayedGame.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        timerEnabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        timerInit: {
            type: DataTypes.NUMBER,
            allowNull: false,
        },
        timerIncrement: {
            type: DataTypes.NUMBER,
            allowNull: false,
        },
        pgn: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        resolution: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        winner: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
    },
    {
        sequelize,
        updatedAt: false,
        indexes: [
            {
                unique: false,
                fields: ["winner"],
            },
            {
                unique: false,
                fields: ["whitePlayerID"],
            },
            {
                unique: false,
                fields: ["blackPlayerID"],
            },
        ],
    }
);

UserProfile.hasMany(PlayedGame, {
    as: "whiteGames",
    foreignKey: {
        name: "whitePlayerID",
        allowNull: false,
    },
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
});
PlayedGame.belongsTo(UserProfile, {
    as: "whitePlayer",
    foreignKey: {
        name: "whitePlayerID",
        allowNull: false,
    },
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
});

UserProfile.hasMany(PlayedGame, {
    as: "blackGames",
    foreignKey: {
        name: "blackPlayerID",
        allowNull: false,
    },
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
});
PlayedGame.belongsTo(UserProfile, {
    as: "blackPlayer",
    foreignKey: {
        name: "blackPlayerID",
        allowNull: false,
    },
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
});

(async () => {
    await sequelize.sync();
})();
