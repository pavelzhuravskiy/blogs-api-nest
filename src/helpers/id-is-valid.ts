export const idIsValid = (id: string | number) => {
  return !isNaN(Number(id));
};
