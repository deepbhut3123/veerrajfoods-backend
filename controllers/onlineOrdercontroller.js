const OnlineOrder = require("../models/onlineOrdermodel"); // adjust path if needed
const ExcelJS = require("exceljs");

const onlineOrder = 
{
// ✅ Add new order
addOrderdetail: async (req, res) => {
  try {
    const newOrder = new OnlineOrder(req.body);
    await newOrder.save();
    res.status(201).json({ success: true, message: "Order created successfully", data: newOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: "Error creating order", error: error.message });
  }
},

// ✅ Get all orders
getOrderdetail: async (req, res) => {
  try {
    const { search, startDate, endDate } = req.query;

    let query = {};

    // ✅ Search filter
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { phoneNo: { $regex: search, $options: "i" } },
        { area: { $regex: search, $options: "i" } },
        { courier: { $regex: search, $options: "i" } },
        { trackingNumber: { $regex: search, $options: "i" } },
        { orderSource : { $regex : search, $options: "i"}},
        { "products.productName": { $regex: search, $options: "i" } },
      ];
    }

    // ✅ Only apply date filter if user selected a range
    if (startDate && endDate) {
      query.orderDate = { $gte: startDate, $lte: endDate };
    }

    const orders = await OnlineOrder.find(query).sort({ orderDate: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
},

// ✅ Get single order by ID
getSingleOrderdetail: async (req, res) => {
  try {
    const order = await OnlineOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching order", error: error.message });
  }
},

updateOrderDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedOrder = await OnlineOrder.findByIdAndUpdate(id, req.body, {
        new: true, // return updated doc
        runValidators: true, // validate before saving
      });

      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Order updated successfully",
        data: updatedOrder,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating order",
        error: error.message,
      });
    }
  },

// ✅ Delete order by ID
deleteOrderDetail: async (req, res) => {
  try {
    const order = await OnlineOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting order", error: error.message });
  }
},

exportToexcel: async (req, res) => {
  try {
    const { payload: orders } = req.body;
    if (!orders || orders.length === 0) {
      return res.status(400).json({ message: "No orders provided" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    worksheet.columns = [
      { header: "Order Date", key: "orderDate", width: 15 },
      { header: "Customer Name", key: "customerName", width: 25 },
      { header: "Phone No", key: "phoneNo", width: 15 },
      { header: "Area", key: "area", width: 20 },
      { header: "Courier", key: "courier", width: 20 },
      { header: "Tracking No", key: "trackingNumber", width: 25 },
      { header: "Total Amount", key: "totalAmount", width: 15 },
      { header: "Order Source", key: "orderSource", width: 15 },
    ];

    orders.forEach((order) => {
      worksheet.addRow(order);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Orders.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Excel export error:", error);
    res.status(500).json({ message: "Failed to export orders" });
  }
}
}

module.exports = onlineOrder
