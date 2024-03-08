exports.getOveriew = (req, res) => {
  res.status(200).render('overview');
};

exports.getTour = (req, res) => {
  res.status(200).render('tour');
};
