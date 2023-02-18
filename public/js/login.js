const login = async (email, password) => {
  try {
      // axious returns promise so to cathc it use await
  // only modern browsers can use async await so be aware of that
  // if there is an error axious will throw error
  const res = await axios({
    method: 'POST',
    url: 'http://localhost:5000/api/v1/users/login',
    data: {
      email,
      password
    }
  })

  console.log(res.s)

  } catch(err) {
    // axious
    console.log(err.response.data)
  }
}

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  login(email, password)

})