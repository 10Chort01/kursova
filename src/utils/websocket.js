import API_URL from '../config';

class WebSocketClient {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectTimeout = 1000;
    }

    connect() {
        try {
            // Використовуємо той самий хост, що й для API
            const wsUrl = API_URL.replace('http', 'ws').replace('/api', '');
            this.ws = new WebSocket(`${wsUrl}/ws`);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.reconnectAttempts = 0;
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.reconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
            this.reconnect();
        }
    }

    reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => this.connect(), this.reconnectTimeout * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    handleMessage(data) {
        // Тут можна додати обробку різних типів повідомлень
        console.log('Received WebSocket message:', data);
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

export default new WebSocketClient(); 