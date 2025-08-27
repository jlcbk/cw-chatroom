
# CW (Morse Code) Real-time Chatroom

This project is a minimalist, real-time, web-based chatroom that uses continuous wave (CW) tones, simulating a Morse Code communication environment.

## Features

- **Real-time Broadcasting:** When a user presses the button, the generated tone is broadcast to all other connected clients in real-time.
- **Stereo Spatial Audio:** The application features a unique spatial audio implementation. Each user is assigned a random, unique frequency for their tone. This frequency determines the perceived stereo position (panning) of the sound, allowing listeners to distinguish different operators by both pitch and spatial location.
- **Simple Interface:** A single button is the entire user interface. Press and hold to transmit, release to stop.
- **Cross-platform:** Works on both desktop (with a mouse) and mobile (with a touchscreen).
- **Built with Web Technologies:** Utilizes Node.js, WebSockets for real-time communication, and the Web Audio API for dynamic tone generation and stereo panning.

## Deployment

Follow these steps to deploy and run the application on your own server.

### Prerequisites

- [Node.js](https://nodejs.org/) (which includes npm) must be installed on your system.

### Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/jlcbk/cw-chatroom.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd cw-chatroom
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Start the server:**
    ```bash
    node server.js
    ```
    The server will start, and you will see a confirmation message, e.g., `Server is listening on port 3001`.

5.  **Firewall Configuration:**
    Ensure that the port the server is running on (default is **3001**) is open in your server's firewall. For example, on Ubuntu with `ufw`:
    ```bash
    sudo ufw allow 3001/tcp
    ```

6.  **Access the Application:**
    Open your web browser and navigate to `http://<your_server_ip>:3001`.
    To test the real-time functionality, open multiple browser tabs or use different devices to connect to the same address.

