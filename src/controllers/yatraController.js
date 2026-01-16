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
    
    // First, let's check if there are any yatras at all
    const allYatras = await Yatra.findAll({ limit: 5 });
    console.log('Total yatras in database:', allYatras.length);
    if (allYatras.length > 0) {
      console.log('Sample yatra dates:', {
        end_date: allYatras[0].end_date,
        registration_start_date: allYatras[0].registration_start_date,
        registration_end_date: allYatras[0].registration_end_date,
        today: today,
        end_date_type: typeof allYatras[0].end_date,
        end_date_value: allYatras[0].end_date?.toString()
      });
    }
    
    // Try a simpler query first: just yatras that haven't ended
    const futureYatras = await Yatra.findAll({ 
      where: { 
        end_date: { [Op.gte]: today }
      },
      limit: 10
    });
    console.log('Yatras that haven\'t ended:', futureYatras.length);
    
    // Active yatras: registration is open AND yatra hasn't ended yet
    // - Yatra hasn't ended: end_date >= today
    // - Registration is open: registration_start_date <= today AND registration_end_date >= today
    const activeYatras = await Yatra.findAll({ 
      where: { 
        // Yatra hasn't ended yet
        end_date: { [Op.gte]: today },
        // Registration has started
        registration_start_date: { [Op.lte]: today },
        // Registration hasn't ended
        registration_end_date: { [Op.gte]: today }
      },
      order: [['start_date', 'ASC']] // Order by start date, earliest first
    });
    
    console.log('Active yatras found (with registration check):', activeYatras.length);
    
    // If no active yatras with registration check, return future yatras as fallback
    // This helps debug if the issue is with registration dates
    if (activeYatras.length === 0 && futureYatras.length > 0) {
      console.log('No yatras with open registration, but found future yatras. Returning future yatras.');
      return successResponse(res, futureYatras, 'Active yatras fetched successfully');
    }
    
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