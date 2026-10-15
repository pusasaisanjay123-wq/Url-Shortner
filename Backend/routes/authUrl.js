import { Router } from 'express';
import { nanoid } from 'nanoid';
import Url from '../models/Url.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = Router();

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

router.post('/shorten', isAuthenticated, async (req, res) => {
  try {
    let { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }

    originalUrl = originalUrl.trim();

    if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
      originalUrl = 'https://' + originalUrl;
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ error: 'Please enter a valid URL' });
    }

    const shortCode = nanoid(8);

    const url = new Url({
      originalUrl,
      shortCode,
      userId: req.session.userId
    });

    await url.save();

    const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;

    res.status(201).json({
      message: 'URL shortened successfully',
      url: {
        originalUrl: url.originalUrl,
        shortUrl,
        shortCode: url.shortCode,
        createdAt: url.createdAt,
        clicks: url.clicks
      }
    });
  } catch (err) {
    console.error('URL shorten error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

router.get('/history', isAuthenticated, async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.session.userId })
      .sort({ createdAt: -1 })
      .lean();

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const urlsWithShortUrl = urls.map(url => ({
      ...url,
      shortUrl: `${baseUrl}/${url.shortCode}`
    }));

    res.json({ urls: urlsWithShortUrl });
  } catch (err) {
    console.error('URL history error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const url = await Url.findOne({
      _id: req.params.id,
      userId: req.session.userId
    });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    await Url.deleteOne({ _id: req.params.id });
    res.json({ message: 'URL deleted successfully' });
  } catch (err) {
    console.error('URL delete error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

export default router;