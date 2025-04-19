# LEADFLUX Payment

This project is a payment processing application built with modern web technologies.

## Tech Stack

- Vite
- TypeScript
- React
- Shadcn-ui
- Tailwind CSS
- Supabase

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd LEADFLUX-PAYMENT

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Deploying to Vercel

### Setup

1. Create a Vercel account at [vercel.com](https://vercel.com) if you don't have one
2. Install Vercel CLI (optional but recommended):
   ```sh
   npm install -g vercel
   ```
3. Login to Vercel:
   ```sh
   vercel login
   ```

### Deployment Options

#### Option 1: Deploy from GitHub

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" > "Project"
4. Import your GitHub repository
5. Configure project settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Set up environment variables from your `.env` file
7. Click "Deploy"

#### Option 2: Deploy using CLI

1. Navigate to your project directory
2. Run:
   ```sh
   vercel
   ```
3. Follow the prompts to configure your project

#### Option 3: Manual Deployment

1. Build your project:
   ```sh
   npm run build
   ```
2. Deploy the `dist` directory to Vercel:
   ```sh
   vercel --prod
   ```

### Troubleshooting Vercel Deployment

If you're experiencing issues with Vercel deployment, check the following:

1. **Build Command**: Ensure your build command is `npm run build`
2. **Node.js Version**: Make sure you're using a compatible Node.js version in Vercel settings
3. **Environment Variables**: Verify all required environment variables are set in the Vercel dashboard
4. **Routing**: Your `vercel.json` file should handle SPA routing correctly:
   ```json
   {
     "rewrites": [
       { 
         "source": "/:path*",
         "has": [
           {
             "type": "host",
             "value": "leadflux.digital"
           }
         ],
         "destination": "/index.html"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
5. **Deployment Logs**: Check the deployment logs in the Vercel dashboard for specific errors

## Contact

For more information about this project, contact the project maintainers.
