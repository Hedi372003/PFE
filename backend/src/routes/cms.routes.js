const express = require("express");

const { protect, adminOnly } = require("../middlewares/auth.middleware");
const {
  getCompanyProfile,
  updateCompanyProfile,
} = require("../controllers/cms.controller");

const router = express.Router();

router.get("/company", getCompanyProfile);
router.put("/company", protect, adminOnly, updateCompanyProfile);

module.exports = router;
