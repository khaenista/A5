/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name:  _Fatima Musharaf Khan_ Student ID: _158450221_   Date: _11th April
********************************************************************************/

// Import necessary modules
const express = require("express");
const path = require('path');
const legoData = require("./modules/legoSets");

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Initialize LEGO data and start the server
legoData.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error("Error initializing LEGO data:", error);
    });

// Routes

// Home page route
app.get("/", (req, res) => {
    res.render("home");
});

// About page route
app.get("/about", (req, res) => {
    res.render("about");
});

// Route to get LEGO sets
app.get("/lego/sets", (req, res) => {
    const theme = req.query.theme;
    if (theme) {
        legoData.getSetsByTheme(theme)
            .then(sets => {
                res.render("sets", { sets: sets });
            })
            .catch(error => {
                console.error("Error getting sets by theme:", error);
                res.status(404).render('404');
            });
    } else {
        legoData.getAllSets()
            .then(sets => {
                res.render("sets", { sets: sets });
            })
            .catch(error => {
                console.error("Error getting all sets:", error);
                res.status(404).render('404');
            });
    }
});

// Route to get a specific LEGO set by its set number
app.get("/lego/sets/:setNum", (req, res) => {
    const setNum = req.params.setNum;
    legoData.getSetByNum(setNum)
        .then(set => {
            res.render("set", { set: set });
        })
        .catch(error => {
            console.error("Error getting set by num:", error);
            res.status(404).render('404');
        });
});

// Route to render the editSet view with set data and theme data
app.get("/lego/editSet/:num", async (req, res) => {
    const setNum = req.params.num;
    try {
        // Get set data by set number
        const set = await legoData.getSetByNum(setNum);
        // Get all themes
        const themes = await legoData.getAllThemes();
        res.render('editSet', { set: set, themes: themes });
    } catch (error) {
        res.status(404).render('404', { message: error });
    }
});

// Route to handle form submission and update set
app.post("/lego/editSet", async (req, res) => {
    const setData = req.body;
    try {
        // Update set with new data
        await legoData.editSet(setData.set_num, setData);
        res.redirect("/lego/sets"); // Redirect to sets route after successful update
    } catch (error) {
        res.status(500).render('500', { message: `I'm sorry, but we have encountered an internal server error: ${error}` });
    }
});

// 404 Route
app.use((req, res) => {
    res.status(404).render('404');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).render('500', { message: `I'm sorry, but we have encountered an internal server error: ${err.message}` });
});
// Route to delete a specific LEGO set by its set number
app.get("/lego/deleteSet/:num", async (req, res) => {
    const setNum = req.params.num;
    try {
        // Delete set by set number
        await legoData.deleteSet(setNum);
        res.redirect("/lego/sets"); // Redirect to sets route after successful deletion
    } catch (error) {
        res.status(500).render('500', { message: `I'm sorry, but we have encountered an internal server error: ${error}` });
    }
});
