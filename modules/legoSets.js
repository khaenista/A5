const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});

const Theme = sequelize.define('Theme', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: Sequelize.STRING,
}, { timestamps: false });

const Set = sequelize.define('Set', {
    set_num: { type: Sequelize.STRING, primaryKey: true },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
}, { timestamps: false });

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

async function initialize() {
    try {
        await sequelize.sync();
        console.log("Database synced successfully.");
    } catch (error) {
        console.error("Failed to initialize database:", error);
        throw error;
    }
}

async function getAllSets() {
    try {
        return await Set.findAll({ include: [Theme] });
    } catch (error) {
        throw new Error("Failed to fetch sets:", error);
    }
}

async function getSetByNum(setNum) {
    try {
        const set = await Set.findOne({ where: { set_num: setNum }, include: [Theme] });
        if (!set) throw new Error("Set not found");
        return set;
    } catch (error) {
        throw new Error("Failed to fetch set:", error);
    }
}

async function getSetsByTheme(theme) {
    try {
        return await Set.findAll({
            include: [{
                model: Theme,
                where: {
                    name: {
                        [Sequelize.Op.iLike]: `%${theme}%`
                    }
                }
            }]
        });
    } catch (error) {
        throw new Error("Failed to fetch sets by theme:", error);
    }
}

async function addSet(setData) {
    try {
        await Set.create(setData);
        console.log("Set added successfully.");
    } catch (error) {
        throw new Error("Failed to add set:", error);
    }
}

async function editSet(set_num, setData) {
    try {
        await Set.update(setData, { where: { set_num } });
        console.log("Set updated successfully.");
    } catch (error) {
        throw new Error(`Failed to update set: ${error.message}`);
    }
}

async function deleteSet(set_num) {
    try {
        await Set.destroy({ where: { set_num } });
        console.log("Set deleted successfully.");
    } catch (error) {
        throw new Error(`Failed to delete set: ${error.message}`);
    }
}

async function getAllThemes() {
    try {
        return await Theme.findAll();
    } catch (error) {
        throw new Error("Failed to fetch themes:", error);
    }
}
async function deleteSet(setNum) {
    try {
        await Set.destroy({ where: { set_num: setNum } });
    } catch (error) {
        throw new Error(`Failed to delete set: ${error.message}`);
    }
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet };

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet };
