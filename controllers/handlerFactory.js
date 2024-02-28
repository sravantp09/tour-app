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

// factory function for performing updation
function updateOne(Model) {
  return async function (req, res, next) {
    try {
      const { id } = req.params;

      const doc = await Model.findByIdAndUpdate(id, req.body, {
        new: true, // indicate return new document
        runValidators: true,
      });

      if (!doc) {
        return res.status(404).json({
          status: 'failed',
          message: 'No document found',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    } catch (err) {
      return res.status(400).json({
        status: 'failed',
        message: err.message,
      });
    }
  };
}

function createOne(Model) {
  return async function (req, res, next) {
    // creating a new tour instance
    try {
      // saving data to the db
      const doc = await Model.create(req.body);

      return res.status(201).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    } catch (err) {
      return res.status(400).json({
        status: 'failed',
        message: err.message,
      });
    }
  };
}

module.exports = {
  deleteOne,
  updateOne,
  createOne,
};
