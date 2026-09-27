const setupOrderSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(
      `Socket connected: ${socket.id}`
    );

    socket.on(
      "join-order-room",
      (orderId) => {
        if (!orderId) {
          return;
        }

        socket.join(`order:${orderId}`);

        console.log(
          `Socket ${socket.id} joined order:${orderId}`
        );
      }
    );

    socket.on(
      "leave-order-room",
      (orderId) => {
        if (!orderId) {
          return;
        }

        socket.leave(`order:${orderId}`);
      }
    );

    // A user joins their own personal room once, right after login/connect.
    // This lets us push status updates to their Orders LIST page (which
    // shows every order at once) in addition to the single-order tracking
    // page, without needing a separate room per order for the list view.
    socket.on(
      "join-user-room",
      (userId) => {
        if (!userId) {
          return;
        }

        socket.join(`user:${userId}`);

        console.log(
          `Socket ${socket.id} joined user:${userId}`
        );
      }
    );

    socket.on(
      "leave-user-room",
      (userId) => {
        if (!userId) {
          return;
        }

        socket.leave(`user:${userId}`);
      }
    );

    socket.on("disconnect", () => {
      console.log(
        `Socket disconnected: ${socket.id}`
      );
    });
  });
};

export default setupOrderSocket;