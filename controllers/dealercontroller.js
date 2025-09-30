const Dealer = require("../models/dealermodel");

// POST /backend/dealers
const dealerController = {
  // controllers/dealerController.js
  addDealer: async (req, res) => {
    try {
      const { dealerName, products } = req.body;

      if (!dealerName || !Array.isArray(products)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid input" });
      }

      const dealer = new Dealer({ dealerName, products });
      await dealer.save();

      res.status(201).json({ success: true, dealer });
    } catch (err) {
      console.error("Error adding dealer:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // GET /backend/dealers
  getAllDealers: async (req, res) => {
    try {
      const dealers = await Dealer.find();
      res.status(200).json(dealers);
    } catch (err) {
      console.error("Error fetching dealers:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  getSingleDealer: async (req, res) => {
    try {
      const dealers = await Dealer.findById(req.params.id);
      if (!dealers)
        return res
          .status(404)
          .json({ success: false, message: "Dealer not found" });
      res.status(200).json({ success: true, data: dealers });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching dealer",
        error: error.message,
      });
    }
  },

  updateDealer: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedDealer = await Dealer.findByIdAndUpdate(id, req.body, {
        new: true, // return updated doc
        runValidators: true, // validate before saving
      });

      if (!updatedDealer) {
        return res.status(404).json({
          success: false,
          message: "Dealer not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Dealer updated successfully",
        data: updatedDealer,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating order",
        error: error.message,
      });
    }
  },

  deleteDealer: async (req, res) => {
    try {
      const deletedDealer = await Dealer.findByIdAndDelete(req.params.id);
      if (!deletedDealer)
        return res.status(404).json({ message: "Dealer not found" });
      res.status(200).json({ message: "Dealer deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
module.exports = dealerController;
