'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Depot = require('../models/depots');

const router = express.Router();

/* ===============USE PASSPORT AUTH JWT ============= */
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  return Depot.find()
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
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Depot.findOne({ _id: id, userId })
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

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  if (!req.body) {
    const err = new Error('Missing `depot` in request body');
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
  const { id } = req.params;
  const userId = req.user.id;

  const updateDepot = {};
  const updateFields = ['depotName', 'streetAddress', 'city', 'state', 'zipcode', 'geocode', 'phone']
  console.log('req.body: ', req.body);
  updateFields.forEach(field => {
    if (field in req.body) {
      console.log('field: ', field);
      updateDepot[field] = req.body[field];
      updateDepot[field] = req.body[field];
      console.log('updateDepot[field]:', updateDepot[field]);
    }
  });

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  Depot.findByIdAndUpdate(id, updateDepot, { new: true })
  // Depot.findOne({ _id: id, userId })
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



/* ========== PUT/UPDATE A SINGLE ITEM ========== */
// router.put('/:id', (req, res, next) => {
//   const { id } = req.params;
//   const userId = req.user.id;

//   const { depotName, streetAddress, city, state, zipcode, geocode, phone, zones, drivers, pickups, deliveries, orders} = req.body;
//   const updateDepot = {};
//   const updateFields = ['depotName', 'streetAddress', 'city', 'state', 'zipcode', 'geocode', 'phone']
//   console.log('req.body: ', req.body);
//   updateFields.forEach(field => {
//     if (field in req.body) {
//       console.log('field: ', field);
//       updateDepot[field] = req.body[field];
//       updateDepot[field] = req.body[field];
//       console.log('updateDepot[field]:', updateDepot[field]);
//     }
//   });

//   /***** Never trust users - validate input *****/
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     const err = new Error('The `id` is not valid');
//     err.status = 400;
//     return next(err);
//   }
//   if (depotId && !mongoose.Types.ObjectId.isValid(depotId)) {
//     const err = new Error('The `depotId` is not valid');
//     err.status = 400;
//     return next(err);
//   }
//   if (depotId === '') {
//     const err = new Error('Missing `id` in request body');
//     err.status = 400;
//     return next(err);
//   }

//   Depot.findOne({ _id: id, userId })
//     .then(result => {
//       if (result) {
//         res.json(result);
//       } else {
//         next();
//       }
//     })
//     .catch(err => {
//       next(err);
//     });
//   // Depot.findOne({ _id: id, userId })
//   //   .then(result => {
//   //     if (result) {
//   //       res.json(result);
//   //     } else {
//   //       next();
//   //     }
//   //   })
//   //   .catch(err => {
//   //     next(err);
//   //   });


//   // Depot.findByIdAndUpdate(id, updateDepot, { new: true })
//   //   .then(result => {
//   //     if (result) {
//   //       res.json(result);
//   //     } else {
//   //       next();
//   //     }
//   //   })
//   //   .catch(err => {
//   //     next(err);
//   //   });
// });

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Depot.deleteOne({ _id: id, userId })
    .then(result => {
      if (result.n) {
        res.sendStatus(204);
      } else {
        res.sendStatus(404);
      }
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;