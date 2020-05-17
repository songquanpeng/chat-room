const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v4: uuid } = require("uuid");

const upload_path = "./public/upload";

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, upload_path);
    },
    filename: function (req, file, callback) {
      let extension = file.originalname.split(".").pop();
      callback(null, uuid() + "." + extension);
    },
  }),
});

router.post("/", upload.single("file"), (req, res, next) => {
  const { file } = req;
  res.json({
    path: "/upload/" + file.filename,
  });
});

module.exports = router;
