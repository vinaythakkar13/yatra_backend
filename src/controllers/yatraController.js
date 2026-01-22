const { Yatra } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { Op } = require('sequelize');

/**
 * Get all yatras
 */
const getYatraController = async (req, res) => {
  try {
    const yatras = await Yatra.findAll();
    return successResponse(res, yatras, 'Yatras fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const createYatraController = async (req, res) => {
  try {
    const { name, banner_image, start_date, end_date, registration_start_date, registration_end_date } = req.body;
    const yatra = await Yatra.create({ name, banner_image, start_date, end_date, registration_start_date, registration_end_date });
    return successResponse(res, yatra, 'Yatra created successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const deleteYatraController = async (req, res) => {
  try {
    const { id } = req.params;
    const yatra = await Yatra.findByPk(id);
    await yatra.destroy();
    return successResponse(res, null, 'Yatra deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getActiveYatrasController = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate date comparison

    // Return all future yatras (haven't ended yet)
    // This includes yatras with any registration status
    const activeYatras = await Yatra.findAll({
      where: {
        end_date: { [Op.gte]: today }
      },
      order: [['start_date', 'ASC']]
    });

    return successResponse(res, activeYatras, 'Active yatras fetched successfully');
  } catch (error) {
    console.error('Error fetching active yatras:', error);
    return errorResponse(res, error.message, 500);
  }
};

const getYatraByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const yatra = await Yatra.findByPk(id);
    if (!yatra) {
      return errorResponse(res, 'Yatra not found', 404);
    }
    return successResponse(res, yatra, 'Yatra fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getYatraController,
  createYatraController,
  deleteYatraController,
  getActiveYatrasController,
  getYatraByIdController
};