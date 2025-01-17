exports.testGet = async (req, res) => {
  res.json({
    message: "TEST_GET",
  });
};

exports.testAuthGet = async (req, res) => {
  res.json({
    message: "TEST_AUTH_GET",
  });
};

exports.testAuthPost = async (req, res) => {
  res.json({
    message: "TEST_AUTH_POST",
  });
};
