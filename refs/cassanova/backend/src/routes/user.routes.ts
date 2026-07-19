import { Router } from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  updateResponsibleGaming,
  toggleFavoriteGame,
  uploadKYCDocument,
  getKYCDocuments
} from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.put('/responsible-gaming', updateResponsibleGaming);
router.post('/favorites', toggleFavoriteGame);
router.post('/kyc/upload', uploadKYCDocument);
router.get('/kyc/documents', getKYCDocuments);

export default router;
