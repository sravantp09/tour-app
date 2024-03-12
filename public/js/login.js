const form = document.querySelector('.form');

async function login(email, password) {
  try {
    const res = await axios({
      method: 'post',
      url: 'http://localhost:8000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.status == 200) {
      alert('Successfully LoggedIn');
    }
  } catch (err) {
    alert(err.response.data.message);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  login(email, password);
});
