const axios = require('axios');
const FormData = require('form-data');
const JSZip = require('jszip');

class DeploymentService {
  constructor() {
    this.netlifyToken = process.env.NETLIFY_ACCESS_TOKEN;
    this.vercelToken = process.env.VERCEL_TOKEN;
  }

  /**
   * Deploy portfolio to Netlify
   * @param {Object} portfolioCode - {html, css, js}
   * @param {string} siteName - Name for the site
   * @returns {Promise<Object>} Deployment result with URL
   */
  async deployToNetlify(portfolioCode, siteName) {
    if (!this.netlifyToken) {
      throw new Error('Netlify access token not configured');
    }

    try {
      console.log('🚀 Deploying to Netlify...');

      // Create a zip file with the portfolio code
      const zip = new JSZip();

      // Add index.html
      zip.file('index.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteName}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
${portfolioCode.html}
  <script src="script.js"></script>
</body>
</html>`);

      // Add CSS
      zip.file('styles.css', portfolioCode.css);

      // Add JavaScript
      zip.file('script.js', portfolioCode.js);

      // Add _redirects for SPA routing
      zip.file('_redirects', '/*    /index.html   200');

      // Generate zip buffer
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

      // Deploy to Netlify
      const response = await axios.post(
        'https://api.netlify.com/api/v1/sites',
        {
          name: siteName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          custom_domain: null
        },
        {
          headers: {
            'Authorization': `Bearer ${this.netlifyToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const siteId = response.data.id;

      // Upload the zip file
      await axios.post(
        `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
        zipBuffer,
        {
          headers: {
            'Authorization': `Bearer ${this.netlifyToken}`,
            'Content-Type': 'application/zip'
          }
        }
      );

      console.log('✅ Deployed to Netlify successfully!');

      return {
        success: true,
        url: response.data.ssl_url || response.data.url,
        platform: 'netlify',
        siteId: siteId
      };

    } catch (error) {
      console.error('❌ Netlify deployment failed:', error.response?.data || error.message);
      throw new Error(`Netlify deployment failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Deploy portfolio to Vercel
   * @param {Object} portfolioCode - {html, css, js}
   * @param {string} projectName - Name for the project
   * @returns {Promise<Object>} Deployment result with URL
   */
  async deployToVercel(portfolioCode, projectName) {
    if (!this.vercelToken) {
      throw new Error('Vercel token not configured');
    }

    try {
      console.log('🚀 Deploying to Vercel...');

      // Prepare files for Vercel deployment
      const files = [
        {
          file: 'index.html',
          data: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
${portfolioCode.html}
  <script src="script.js"></script>
</body>
</html>`
        },
        {
          file: 'styles.css',
          data: portfolioCode.css
        },
        {
          file: 'script.js',
          data: portfolioCode.js
        },
        {
          file: 'vercel.json',
          data: JSON.stringify({
            version: 2,
            builds: [
              {
                src: "index.html",
                use: "@vercel/static"
              }
            ],
            routes: [
              {
                src: "/(.*)",
                dest: "/index.html"
              }
            ]
          })
        }
      ];

      // Create deployment
      const response = await axios.post(
        'https://api.vercel.com/v13/deployments',
        {
          name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          files: files.map(f => ({
            file: f.file,
            data: Buffer.from(f.data).toString('base64')
          })),
          projectSettings: {
            framework: null
          },
          target: 'production'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.vercelToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Deployed to Vercel successfully!');

      return {
        success: true,
        url: `https://${response.data.url}`,
        platform: 'vercel',
        deploymentId: response.data.id
      };

    } catch (error) {
      console.error('❌ Vercel deployment failed:', error.response?.data || error.message);
      throw new Error(`Vercel deployment failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Check if deployment service is available
   * @param {string} platform - 'netlify' or 'vercel'
   * @returns {boolean}
   */
  isAvailable(platform) {
    if (platform === 'netlify') {
      return !!this.netlifyToken;
    } else if (platform === 'vercel') {
      return !!this.vercelToken;
    }
    return false;
  }

  /**
   * Get deployment instructions for manual deployment
   * @param {Object} portfolioCode - {html, css, js}
   * @param {string} siteName - Name for the site
   * @returns {Object} Instructions and download link
   */
  getManualDeploymentInstructions(portfolioCode, siteName) {
    return {
      instructions: [
        '1. Download the portfolio files (ZIP)',
        '2. Go to Netlify Drop (https://app.netlify.com/drop) or Vercel',
        '3. Drag and drop the ZIP file',
        '4. Your portfolio will be live in seconds!'
      ],
      platforms: [
        {
          name: 'Netlify Drop',
          url: 'https://app.netlify.com/drop',
          description: 'Easiest option - just drag and drop'
        },
        {
          name: 'Vercel',
          url: 'https://vercel.com/new',
          description: 'Fast and reliable hosting'
        },
        {
          name: 'GitHub Pages',
          url: 'https://pages.github.com/',
          description: 'Free hosting with GitHub'
        }
      ]
    };
  }
}

module.exports = new DeploymentService();
