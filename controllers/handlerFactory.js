//  Factory function
function deleteOne(Model) {
  return async function (req, res, next) {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);

      if (!doc) {
        return res.status(404).json({
          status: 'failed',
          message: 'No document found',
        });
      }

      return res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      return res.status(400).json({
        status: 'error',
        message: 'Something went wrong!',
      });
    }
  };
}

module.exports = {
  deleteOne,
};
