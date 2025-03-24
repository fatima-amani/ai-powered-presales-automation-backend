const mongoose = require('mongoose');

// const PositionSchema = new mongoose.Schema({
//   x: { type: Number, required: true },
//   y: { type: Number, required: true }
// }, { _id: false });

// const ElementSchema = new mongoose.Schema({
//   type: { type: String, required: true },           // e.g., 'header', 'textbox', 'button', 'list', 'chart', etc.
//   label: { type: String, required: true },
//   position: { type: PositionSchema, required: true },
//   width: { type: Number },                           // optional (used for 'chart' width/height, etc.)
//   height: { type: Number }                           // optional
// }, { _id: false });

// const PageSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   elements: { type: [ElementSchema], required: true }
// }, { _id: false });

// const WireframeSchema = new mongoose.Schema({
//   pages: { type: [PageSchema], required: true }
// }, { timestamps: true }); // includes createdAt & updatedAt timestamps

const WireframeSchema = new mongoose.Schema({
    image_link: [{type: String}]

});

module.exports = mongoose.model('Wireframe', WireframeSchema);
