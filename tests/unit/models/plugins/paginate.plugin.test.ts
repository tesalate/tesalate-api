import mongoose, { Model } from 'mongoose';
import setupTestDB from '../../../utils/setupTestDB';
import paginate from '../../../../src/models/plugins/paginate.plugin';
import { IPaginator } from '../../../../src/models/types';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
});

projectSchema.plugin(paginate);
interface ProjectModel extends Model<typeof projectSchema>, IPaginator {}
const Project = mongoose.model<typeof projectSchema, ProjectModel>('Project', projectSchema);

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  project: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Project',
    required: true,
  },
});

taskSchema.plugin(paginate);
interface TaskModel extends Model<typeof taskSchema>, IPaginator {}
const Task = mongoose.model<typeof taskSchema, TaskModel>('Task', taskSchema);

setupTestDB();

describe('paginate plugin', () => {
  describe('populate option', () => {
    test('should populate the specified data fields', async () => {
      const project = await Project.create({ name: 'Project One' });
      const task = await Task.create({ name: 'Task One', project: project._id });

      const taskPages = await Task.paginate({ _id: task._id }, { populate: 'project' });

      expect(taskPages.results[0].project).toHaveProperty('_id', project._id);
    });

    test('should populate nested fields', async () => {
      const project = await Project.create({ name: 'Project One' });
      const task = await Task.create({ name: 'Task One', project: project._id });

      const projectPages = await Project.paginate({ _id: project._id }, { populate: 'tasks.project' });
      const { tasks } = projectPages.results[0];

      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toHaveProperty('_id', task._id);
      expect(tasks[0].project).toHaveProperty('_id', project._id);
    });
  });
});
