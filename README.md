# Hello World

## About the Artwork

"Hello World" is an interactive digital art piece that captures your image in real-time via webcam and applies edge detection processing similar to pixel art.

Using the programming entry point "Hello World" as a concept, this work visually explores the boundary between the digital world and reality.

### Visual Expression

Your image captured by the webcam has only its contours extracted by an edge detection algorithm and is pixelated. This abstract representation offers a new perspective on our existence in digital space.

- A digital "you" appears with colored lines against a monochrome background
- You can observe movements within a space divided by a pixel grid
- You can adjust your sense of distance from reality by changing the edge detection strength

### Interaction

In this artwork, you can customize your experience by freely adjusting the following elements:

- **Pixel Size**: Increase for more abstraction, decrease to see more details
- **Edge Detection Threshold**: Adjust the sensitivity of contour detection
- **Blur Effect**: Change the balance between image smoothness and granularity
- **Line Color**: Choose your own color to personalize the expression

You can also "capture" and save moments you like.

### About the Technology

This work is implemented using the following technical elements:

- **Video Processing**: Edge detection using Sobel filter and preprocessing with Gaussian blur
- **Framework**: Modern web technologies using Next.js and React
- **Animation**: Smooth movements and transitions with Framer Motion

## How to Experience

1. Clone the repository
```bash
git clone [Repository URL]
cd hello-world
```

2. Install dependencies
```bash
pnpm install
```

3. Start the development server
```bash
pnpm dev
```

4. Open `http://localhost:3000` in your browser and allow camera access

5. Customize your experience using various controls
   - Adjust parameters with sliders
   - Change line color with color picker
   - Save moments with the capture button

## License

This project is released under the MIT License. You are free to use, modify, and redistribute it. 
