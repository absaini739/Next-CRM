import { Router } from 'express';
import { createPerson, getPersons, getPerson, updatePerson, deletePerson, getPersonEmails } from '../controllers/person.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createPerson);
router.get('/', getPersons);
router.get('/:id', getPerson);
router.get('/:id/emails', getPersonEmails);
router.put('/:id', updatePerson);
router.delete('/:id', deletePerson);

export default router;
