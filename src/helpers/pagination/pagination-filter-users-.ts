export const filterUsers = (
  banStatus: string,
  login: string,
  email: string,
) => {
  let loginFilter = '%';
  let emailFilter = '%';
  let banStatus01 = true;
  let banStatus02 = false;

  if (banStatus === 'banned') {
    banStatus02 = true;
  }

  if (banStatus === 'notBanned') {
    banStatus01 = false;
  }

  if (login && !email) {
    loginFilter = `%${login}%`;
    emailFilter = '';
  }

  if (!login && email) {
    loginFilter = '';
    emailFilter = `%${email}%`;
  }

  if (login && email) {
    loginFilter = `%${login}%`;
    emailFilter = `%${email}%`;
  }

  return {
    login: loginFilter,
    email: emailFilter,
    banStatus01: banStatus01,
    banStatus02: banStatus02,
  };
};
