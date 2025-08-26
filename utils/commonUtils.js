
export const updateBatchStatus = async (batch, today) => {
  const fromDate = new Date(batch.fromDate);
  const toDate = new Date(batch.toDate);
  let newStatus;

  if (fromDate > today) {
    newStatus = "Up Coming";
  } else if (fromDate <= today && toDate >= today) {
    newStatus = "On Going";
  } else if (toDate < today) {
    newStatus = "Completed";
  }

  if (batch.status !== newStatus) {
    batch.status = newStatus;
    await batch.save(); // Update DB
  }
  return batch;
};
