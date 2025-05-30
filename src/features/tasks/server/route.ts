import { ID, Query } from "node-appwrite";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";
import { getMember } from "@/features/members/utils";
import { createTaskSchema } from "../schemas";
import { Task, TaskStatus, TaskPriority } from "../types";

const app = new Hono()
  // DELETE task
  .delete("/:taskId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { taskId } = c.req.param();

    const task = await databases.getDocument(DATABASE_ID, TASKS_ID, taskId);

    const member = await getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await databases.deleteDocument(DATABASE_ID, TASKS_ID, taskId);
    return c.json({ data: { $id: task.$id } });
  })

  // GET list of tasks (with filtering and search)
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.nativeEnum(TaskStatus).nullish(),
        search: z.string().nullish(),
        startDate: z.string().nullish(),
        dueDate: z.string().nullish(),
        priority: z.nativeEnum(TaskPriority).nullish(),
      })
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");

      const {
        workspaceId,
        projectId,
        assigneeId,
        status,
        search,
        startDate,
        dueDate,
        priority,
      } = c.req.valid("query");

      // Debug logging
      console.log("Search parameter received:", search);

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const query = [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt"),
      ];

      if (projectId) query.push(Query.equal("projectId", projectId));
      if (status) query.push(Query.equal("status", status));
      if (assigneeId) query.push(Query.equal("assigneeId", assigneeId));
      
      if (startDate && dueDate) {
        query.push(Query.between("dueDate", startDate, dueDate));
      } else if (startDate) {
        query.push(Query.greaterThanEqual("startDate", startDate));
      } else if (dueDate) {
        query.push(Query.lessThanEqual("dueDate", dueDate));
      }

      if (priority) query.push(Query.equal("priority", priority));
      
      // Search implementation - using your search_tasks index
      if (search && search.trim()) {
        console.log("Adding search query for:", search);
        // Since your index is on name,description, search on name will search both
        query.push(Query.search("name", search.trim()));
      }

      console.log("Final query:", query);

      const tasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, query);

      // Filter out undefined IDs for safety
      const projectIds = tasks.documents
        .map((task) => task.projectId)
        .filter((id): id is string => !!id);

      const assigneeIds = tasks.documents
        .map((task) => task.assigneeId)
        .filter((id): id is string => !!id);

      const projects = await databases.listDocuments(
        DATABASE_ID,
        PROJECTS_ID,
        projectIds.length > 0 ? [Query.contains("$id", projectIds)] : []
      );

      const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : []
      );

      const assignees = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);
          return {
            ...member,
            name: user.name || user.email,
            email: user.email,
          };
        })
      );

      const populatedTasks = tasks.documents.map((task) => {
        const project = task.projectId
          ? projects.documents.find((project) => project.$id === task.projectId)
          : null;

        const assignee = task.assigneeId
          ? assignees.find((assignee) => assignee.$id === task.assigneeId)
          : null;

        return {
          ...task,
          project,
          assignee,
        };
      });

      return c.json({ data: { ...tasks, documents: populatedTasks } });
    }
  )

  // CREATE new task
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");

      const {
        name,
        status,
        workspaceId,
        projectId,
        startDate,
        dueDate,
        assigneeId,
        description,
        dependencyIds,
        priority = TaskPriority.LOW,
      } = c.req.valid("json");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const highestPositionTask = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("status", status),
          Query.equal("workspaceId", workspaceId),
          Query.orderAsc("position"),
          Query.limit(1),
        ]
      );

      const newPosition =
        highestPositionTask.documents.length > 0
          ? highestPositionTask.documents[0].position + 1000
          : 1000;

      const task = await databases.createDocument(DATABASE_ID, TASKS_ID, ID.unique(), {
        name,
        status,
        workspaceId,
        projectId,
        startDate: startDate || new Date().toISOString(),
        dueDate,
        assigneeId,
        description,
        position: newPosition,
        dependencyIds,
        priority,
      });

      return c.json({ data: task });
    }
  )

  // PATCH (update) task
  .patch(
    "/:taskId",
    sessionMiddleware,
    zValidator("json", createTaskSchema.partial()),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");

      const {
        name,
        status,
        projectId,
        startDate,
        dueDate,
        assigneeId,
        description,
        dependencyIds,
        priority,
      } = c.req.valid("json");

      const { taskId } = c.req.param();

      const existingTask = await databases.getDocument(DATABASE_ID, TASKS_ID, taskId);

      const member = await getMember({
        databases,
        workspaceId: existingTask.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const task = await databases.updateDocument(DATABASE_ID, TASKS_ID, taskId, {
        name,
        status,
        projectId,
        startDate,
        dueDate,
        assigneeId,
        description,
        dependencyIds,
        priority,
      });

      return c.json({ data: task });
    }
  )

  // GET single task by ID
  .get("/:taskId", sessionMiddleware, async (c) => {
    const currentUser = c.get("user");
    const databases = c.get("databases");
    const { users } = await createAdminClient();
    const { taskId } = c.req.param();

    const task = await databases.getDocument(DATABASE_ID, TASKS_ID, taskId);

    const currentMember = await getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: currentUser.$id,
    });

    if (!currentMember) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const project = task.projectId
      ? await databases.getDocument(DATABASE_ID, PROJECTS_ID, task.projectId)
      : null;

    const member = task.assigneeId
      ? await databases.getDocument(DATABASE_ID, MEMBERS_ID, task.assigneeId)
      : null;

    const user = member ? await users.get(member.userId) : null;

    const assignee =
      member && user
        ? {
            ...member,
            name: user.name || user.email,
            email: user.email,
          }
        : null;

    return c.json({
      data: {
        ...task,
        project,
        assignee,
      },
    });
  })

  // BULK UPDATE tasks
  .post(
    "/bulk-update",
    sessionMiddleware,
    zValidator(
      "json",
      z.object({
        tasks: z.array(
          z.object({
            $id: z.string(),
            status: z.nativeEnum(TaskStatus),
            position: z.number().int().positive().min(1000).max(1_000_000),
          })
        ),
      })
    ),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { tasks } = c.req.valid("json");

      const tasksToUpdate = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [Query.contains("$id", tasks.map((task) => task.$id))]
      );

      const workspaceIds = new Set(
        tasksToUpdate.documents.map((task) => task.workspaceId)
      );

      if (workspaceIds.size !== 1) {
        return c.json(
          { error: "All tasks must belong to the same workspace." },
          400
        );
      }

      const workspaceId = workspaceIds.values().next().value;

      if (!workspaceId) {
        return c.json({ error: "Workspace ID is required." }, 400);
      }

      const member = await getMember({
        databases,
        workspaceId: workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const updatedTasks = await Promise.all(
        tasks.map(async (task) => {
          const { $id, status, position } = task;
          return databases.updateDocument(DATABASE_ID, TASKS_ID, $id, {
            status,
            position,
          });
        })
      );

      return c.json({ data: updatedTasks });
    }
  );

export default app;
