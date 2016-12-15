define([
  'dojo/_base/declare',
  'dstore/Rest',
  'dstore/Trackable'
], function (
  declare,
  Rest,
  Trackable
) {
  return declare([Rest, Trackable]);
});