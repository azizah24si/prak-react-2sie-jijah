import { useState, useEffect } from "react";
import { AiFillDelete } from "react-icons/ai";

import PageHeader from "../../components/PageHeader";
import AlertBox from "../../components/AlertBox";
import GenericTable from "../../components/GenericTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

import { notesAPI } from "../../services/notesAPI";

export default function Notes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notes, setNotes] = useState([]);

  const [dataForm, setDataForm] = useState({
    title: "",
    content: "",
    status: "",
  });

  // Load data saat pertama render
  useEffect(() => {
    loadNotes();
  }, []);

  // Ambil data notes dari API
  const loadNotes = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await notesAPI.fetchNotes();
      setNotes(data);
    } catch (err) {
      setError("Gagal memuat catatan");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle perubahan input
  const handleChange = (evt) => {
    const { name, value } = evt.target;

    setDataForm({
      ...dataForm,
      [name]: value,
    });
  };

  // Handle tambah data
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await notesAPI.createNote(dataForm);

      setSuccess("Catatan berhasil ditambahkan!");

      // Reset form
      setDataForm({
        title: "",
        content: "",
        status: "",
      });

      // Refresh data
      await loadNotes();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle hapus data
  const handleDelete = async (id) => {
    const konfirmasi = window.confirm(
      "Yakin ingin menghapus catatan ini?"
    );

    if (!konfirmasi) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await notesAPI.deleteNote(id);

      setSuccess("Catatan berhasil dihapus!");

      await loadNotes();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader title="Notes App" />

      {error && <AlertBox type="error">{error}</AlertBox>}

      {success && <AlertBox type="success">{success}</AlertBox>}

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Tambah Catatan Baru
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            value={dataForm.title}
            placeholder="Judul catatan"
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full p-3 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
          />

          <textarea
            name="content"
            value={dataForm.content}
            placeholder="Isi catatan"
            onChange={handleChange}
            disabled={loading}
            required
            rows="3"
            className="w-full p-3 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            {loading ? "Mohon Tunggu..." : "Tambah Catatan"}
          </button>
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-6">
          <LoadingSpinner text="Memuat catatan..." />
        </div>
      )}

      {/* Empty State */}
      {!loading && notes.length === 0 && !error && (
        <div className="mt-6">
          <EmptyState text="Belum ada catatan. Tambah catatan pertama!" />
        </div>
      )}

      {/* Error State */}
      {!loading && notes.length === 0 && error && (
        <div className="mt-6">
          <EmptyState text="Terjadi Kesalahan. Coba lagi nanti." />
        </div>
      )}

      {/* Notes Table */}
      {!loading && notes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-10">
          <div className="px-6 py-4">
            <h3 className="text-lg font-semibold">
              Daftar Catatan ({notes.length})
            </h3>
          </div>

          <GenericTable
            columns={["#", "Judul", "Isi Catatan", "Aksi"]}
            data={notes}
            renderRow={(note, index) => (
              <>
                <td className="px-6 py-4 font-medium text-gray-700">
                  {index + 1}.
                </td>

                <td className="px-6 py-4">
                  <div className="font-semibold text-emerald-600">
                    {note.title}
                  </div>
                </td>

                <td className="px-6 py-4 max-w-xs">
                  <div className="truncate text-gray-600">
                    {note.content}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={loading}
                    className="disabled:opacity-50"
                  >
                    <AiFillDelete className="text-red-400 text-2xl hover:text-red-600 transition-colors" />
                  </button>
                </td>
              </>
            )}
          />
        </div>
      )}
    </div>
  );
}