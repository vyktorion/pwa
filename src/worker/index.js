self.addEventListener("push", async (event) => {
	const data = event.data.json();

	console.log('📨 [SW] Received push notification:', data);

	// 1. Trimite mesaj către TOATE tab-urile active pentru real-time update
	await self.clients.matchAll({ type: "window", includeUncontrolled: true })
		.then(clients => {
			console.log('👥 [SW] Found active clients:', clients.length);
			for (const client of clients) {
				console.log('📤 [SW] Sending NEW_MESSAGE to client:', client.id);
				client.postMessage({
					type: "NEW_MESSAGE",
					conversationId: data.conversationId,
					message: data
				});
			}
		});

	// 2. Notificare vizuală (toate platformele)
	event.waitUntil(
		self.registration.showNotification(data.title, {
			body: data.body,
			icon: "/icon512_rounded.png",
			vibrate: [200, 100, 200],
			data: { conversationId: data.conversationId },
			requireInteraction: true,
			badge: "/icon512_maskable.png"
		})
	);

	// 3. Detectare PWA pentru sunet
	const isPWA = self.matchMedia('(display-mode: standalone)').matches ||
	              self.navigator.standalone === true;

	// 4. Sunet doar pentru PWA
	if (isPWA) {
		try {
			// Redă sunet de notificare pentru PWA
			const audio = new Audio('/ping.mp3');
			audio.volume = 0.7; // Volum moderat
			audio.play().catch(error => {
				console.error('Audio playback failed:', error);
			});
		} catch (error) {
			console.error('Audio setup failed:', error);
		}
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