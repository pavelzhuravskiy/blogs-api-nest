export const exceptionObject = (field: string) => {
  return {
    errorsMessages: [
      {
        message: expect.any(String),
        field: field,
      },
    ],
  };
};
