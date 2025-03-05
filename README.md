# Question Collection Tool

A simple web application that allows users to upload images of questions, arrange them in a desired order, and compile them into a PDF document.

## Features

- Drag and drop interface for uploading images
- Simple UI for rearranging question order
- PDF generation with date stamp
- Responsive design for desktop and mobile devices

## Deployment Instructions

This application is ready to be deployed on Vercel. Follow these steps:

1. Create a Vercel account if you don't have one: https://vercel.com/signup
2. Install the Vercel CLI: `npm i -g vercel`
3. Open terminal/command prompt in the project directory
4. Run `vercel login` and follow the instructions
5. Run `vercel` to deploy the project

Alternatively, you can connect your GitHub repository to Vercel for automatic deployments.

## Local Development

To test locally, you can use any simple web server. For example:

- Using Python: `python -m http.server`
- Using Node.js: Install `http-server` with `npm install -g http-server` and run `http-server`

## Libraries Used

- jsPDF: For PDF generation
- Sortable.js: For drag-and-drop reordering functionality

## Browser Compatibility

This tool works best in modern browsers (Chrome, Firefox, Safari, Edge).
