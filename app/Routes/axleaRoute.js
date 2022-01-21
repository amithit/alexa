




module.exports = app => {

  app.post("/api/v1/aleax", async function (req, res) {
    console.log("Request message::")
    console.log(JSON.stringify(req.body));
    res.send('OK')
  });
}

