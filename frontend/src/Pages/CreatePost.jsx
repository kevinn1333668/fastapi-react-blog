// CreatePost.jsx
import { Form, useActionData, useNavigation } from "react-router-dom";

export default function CreatePost() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-2xl p-6 mx-auto">
      <h2 className="mb-6 text-2xl font-bold">Создать пост</h2>

      <Form method="post" className="space-y-4">
        <div>
          <label className="block mb-2">Содержание</label>
          <textarea
            name="content"
            required
            rows={6}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Введите текст поста..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked
            className="w-4 h-4"
          />
          <label>Опубликовать сразу</label>
        </div>

        {actionData?.error && (
          <p className="text-red-500">{actionData.error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? "Создание..." : "Создать пост"}
        </button>
      </Form>
    </div>
  );
}
