import { Request, Response, NextFunction } from 'express';
import Todo from '../models/Todo';

// @desc    Get all todos for a user
// @route   GET /api/todos
// @access  Private
export const getTodos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todos = await Todo.find({ user: req.user!._id }).sort({ createdAt: -1 });

    res.status(200).json(todos);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new todo
// @route   POST /api/todos
// @access  Private
export const createTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({
        success: false,
        message: 'Please provide a todo text'
      });
      return;
    }

    const todo = await Todo.create({
      text,
      user: req.user!._id
    });

    res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single todo
// @route   GET /api/todos/:id
// @access  Private
export const getTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user!._id });

    if (!todo) {
      res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
      return;
    }

    res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a todo
// @route   PUT /api/todos/:id
// @access  Private
export const updateTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({
        success: false,
        message: 'Please provide a todo text'
      });
      return;
    }

    let todo = await Todo.findOne({ _id: req.params.id, user: req.user!._id });

    if (!todo) {
      res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
      return;
    }

    todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { text },
      { new: true, runValidators: true }
    );

    res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
// @access  Private
export const deleteTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user!._id });

    if (!todo) {
      res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
      return;
    }

    await todo.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle todo completion status
// @route   PATCH /api/todos/:id/toggle
// @access  Private
export const toggleTodoStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let todo = await Todo.findOne({ _id: req.params.id, user: req.user!._id });

    if (!todo) {
      res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
      return;
    }

    todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { completed: !todo.completed },
      { new: true, runValidators: true }
    );

    res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
};

// @desc    Get completed todos
// @route   GET /api/todos/completed
// @access  Private
export const getCompletedTodos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todos = await Todo.find({ 
      user: req.user!._id,
      completed: true 
    }).sort({ updatedAt: -1 });

    res.status(200).json(todos);
  } catch (error) {
    next(error);
  }
};

// @desc    Get incomplete todos
// @route   GET /api/todos/incomplete
// @access  Private
export const getIncompleteTodos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todos = await Todo.find({ 
      user: req.user!._id,
      completed: false 
    }).sort({ createdAt: -1 });

    res.status(200).json(todos);
  } catch (error) {
    next(error);
  }
};