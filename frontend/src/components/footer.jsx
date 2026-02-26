import { GraduationCap } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

export default function Footer() {
  const [examLevels, setExamLevels] = useState([])
  useEffect(() => {
    ;(async () => {
      const levelsRes = await fetch("http://localhost:8888/api/exam-levels")
      const levelsData = await levelsRes.json()
      if (levelsData.success) {
        setExamLevels(levelsData.body)
      }
    })()
  })
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-8 h-8 text-indigo-400" />
              <h3 className="text-xl font-bold">ExamCoach</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Your comprehensive exam preparation platform for A/L and O/L
              students in Sri Lanka.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/community/forum" className="hover:text-white">
                  Forum
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {examLevels.map((level) => (
                <li key={level._id}>
                  <Link
                    to={`/browse/${level._id}`}
                    className="hover:text-white"
                  >
                    {level.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: info@examcoach.lk</li>
              <li>Phone: +94 11 234 5678</li>
              <li>
                <Link to="/contact" className="hover:text-white">
                  Contact Form
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>© 2026 ExamCoach. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
