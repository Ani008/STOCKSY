const express = require("express");
const router = express.Router();

const { googleLogin } = require("../controllers/googleAuth");

router.post("/", googleLogin);

module.exports = router;