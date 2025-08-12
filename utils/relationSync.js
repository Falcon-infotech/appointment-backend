/**
 * Sync relationship between two models
 * 
 * @param {Object} options
 * @param {Model} options.sourceModel 
 * @param {Model} options.targetModel 
 * @param {String} options.sourceId 
 * @param {String} options.targetField 
 * @param {Array} options.oldTargetIds 
 * @param {Array} options.newTargetIds 
 */
export async function syncRelation({
  targetModel,
  sourceId,
  targetField,
  oldTargetIds = [],
  newTargetIds = [],
}) {

  if (oldTargetIds.length > 0) {
    await targetModel.updateMany(
      { _id: { $in: oldTargetIds } },
      { $pull: { [targetField]: sourceId } }
    );
  }

  if (newTargetIds.length > 0) {
    await targetModel.updateMany(
      { _id: { $in: newTargetIds } },
      { $addToSet: { [targetField]: sourceId } }
    );
  }
}
