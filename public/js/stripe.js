const stripe = Stripe('pk_test_51MeGzbFJcSJT6puUFXnFKVodXAjaJrFWIdVmsshd3Hcd2XemiTQWzDQ0kSclyWreJbHYUZXftrzQDJd5bcShr64X00DvbH9n9l')

export const bookTour = async tourId => {
  // 1) Get checkout session from API
  console.log('book tour')
  const session = await axios(`http://localhost:5000/api/v1/booking/checkout-session/${tourId}`)
  console.log('session', session)
    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });

    // if (session) window.location.href = session.data.session.url;

  console.log(session)
}