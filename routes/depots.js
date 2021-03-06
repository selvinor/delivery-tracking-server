'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Delivery = require('../models/deliveries');
const Depot = require('../models/depots');
const Driver = require('../models/drivers');
const Vendor = require('../models/vendors');

const router = express.Router();

/* ===============USE PASSPORT AUTH JWT ============= */
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  Depot.find()
  .populate('zones')
  .populate('drivers', 'driverName driverPhone driverVehicleMake driverVehicleModel')
  .populate({
    path: 'pickups',
    select: 'pickupDate pickupTimeSlot depot pickupStatus updatedAt',
    populate: { 
      path: 'pickupVendor', 
      select: 'vendorName vendorLocation vendorPhone', 
      populate: {
        path: 'orders',
        select: 'orderNumber orderDescription orderSize  destination.recipient destination.recipientPhone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
      }
    }
  })
  .populate({
    path: 'deliveries', 
    select: 'deliveryDate depot zone deliveryStatus updatedAt',
    populate: {
      path: 'order',
      select: 'orderNumber orderDescription orderSize vendor destination.recipient destination.recipientPhone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
      populate: { 
        path: 'vendor', 
        select: 'vendorName vendorLocation vendorPhone'
      }
    }
  })
  .then(result => {
    return res
    .status(200)
    .json(result);
  })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */

router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Depot.findOne({ _id: id })
  .populate('zones')
  .populate('drivers', 'driverName driverPhone driverVehicleMake driverVehicleModel')
  .populate({
    path: 'pickups',
    select: 'pickupDate pickupTimeSlot depot pickupStatus updatedAt',
    populate: { 
      path: 'pickupVendor', 
      select: 'vendorName vendorLocation vendorPhone', 
      populate: {
        path: 'orders',
        select: 'orderNumber orderDescription orderSize  destination.recipient destination.recipientPhone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
      }
    }
  })
  .populate({
    path: 'deliveries', 
    select: 'deliveryDate depot zone deliveryStatus updatedAt',
    populate: {
      path: 'order',
      select: 'orderNumber orderDescription orderSize vendor destination.recipient destination.recipientPhone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
      populate: { 
        path: 'vendor', 
        select: 'vendorName vendorLocation vendorPhone'
      }
    }
  })
  .then(result => {
    return res
    .status(200)
    .json(result);
  })
    .catch(err => {
      next(err);
    });
});
/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  if (!req.body) {
    const err = new Error('Missing `delivery` in request body');
    err.status = 400;
    return next(err);
  }

  Depot.create(req.body).then(result => {
    res
      .location(`${req.originalUrl}/${result.id}`)
      .status(201)
      .json(result);
  })
    .catch(err => {
      next(err);
    });
}); 
/* ========== GET/READ A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  // const { id } = req.params;
  const id = req.params.id;
  const updateDepot = {};
  const updateFields = ['depotName', 'streetAddress', 'city', 'state', 'zipcode', 'zones', 'deliveries, vendors']

  updateFields.forEach(field => {
    if (field in req.body) {
      updateDepot[field] = req.body[field];
    }
  });

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  Depot.findByIdAndUpdate( {_id: id}, updateDepot,   { $push: { delivery: updateDepot } })
  .then(result => {
    if (result) {
      res.json(result);
    } else {
      next();
    }
  })
  .catch(err => {
    next(err);
  });
});


/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  const depotRemovePromise = Depot.findByIdAndRemove({ _id: id, userId });
  const driverUpdatePromise = Driver.update({ depot: id, userId }, { $pull: { depot: id } })
  const vendorUpdatePromise = Vendor.update({depot: id, userId }, { $pull: { depot: id }})
  const deliveryUpdatePromise = Delivery.update({depot: id, userId }, { $pull: { depot: id }})
  const zoneUpdatePromise = Zone.update({depot: id, userId }, { $pull: { depot: id }})

  // Promise.all([depotRemovePromise , deliveryUpdatePromise, driverUpdatePromise, vendorUpdatePromise, zoneUpdatePromise ])
  Promise.all([depotRemovePromise  ])
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
 
});

module.exports = router;