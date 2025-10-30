// Push notifications for navbar updates via Zustand
// Service worker handles push events and forwards to main thread

self.addEventListener("push", (event) => {
  console.log("📨 [SW] Push event received");

  if (event.data) {
    const data = event.data.json();
    console.log("📨 [SW] Push data:", data);

    // Forward the message to the main thread for Zustand state update
    self.clients.matchAll().then((clients) => {
      console.log(`📨 [SW] Found ${clients.length} clients to notify`);

      clients.forEach((client) => {
        console.log(`📨 [SW] Sending NEW_MESSAGE to client:`, client.url);
        client.postMessage({
          type: "NEW_MESSAGE",
          conversationId: data.conversationId,
          senderId: data.senderId,
        });
      });
    });

    // Show notification
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: "/icon512_rounded.png",
        badge: "/icon512_maskable.png",
        data: { conversationId: data.conversationId },
        requireInteraction: true,
        vibrate: [200, 100, 200],
      })
    );
  } else {
    console.log("📨 [SW] No data in push event");
  }
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	// Deschide pagina de mesaje pentru conversația specifică
	const conversationId = event.notification.data?.conversationId;

	event.waitUntil(
		clients.matchAll({ type: "window" })
			.then((clientList) => {
				// Caută tab-ul de mesaje deja deschis
				for (const client of clientList) {
					if (client.url.includes('/messages') && "focus" in client) {
						// Dacă e deja pe messages, doar focus
						if (conversationId) {
							// Trimite mesaj către tab să deschidă conversația
							client.postMessage({
								type: "OPEN_CONVERSATION",
								conversationId
							});
						}
						return client.focus();
					}
				}

				// Dacă nu e deschis tab-ul de messages, deschide-l
				if (clients.openWindow) {
					const url = conversationId
						? `/messages?conversation=${conversationId}`
						: '/messages';
					return clients.openWindow(url);
				}
			})
	);
});