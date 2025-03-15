import express from 'express';
import { 
  getTodos, 
  createTodo, 
  getTodo, 
  updateTodo, 
  deleteTodo, 
  toggleTodoStatus,
  getCompletedTodos,
  getIncompleteTodos
} from '../controllers/todos';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route('/')
  .get(getTodos)
  .post(createTodo);

router.get('/completed', getCompletedTodos);
router.get('/incomplete', getIncompleteTodos);

router.route('/:id')
  .get(getTodo)
  .put(updateTodo)
  .delete(deleteTodo);

router.patch('/:id/toggle', toggleTodoStatus);

export default router;