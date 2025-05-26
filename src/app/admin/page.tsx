'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, updateDoc, addDoc, query, orderBy, Timestamp } from 'firebase/firestore'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import type { Person } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { VoiceRecorder } from '@/components/ui/voice-recorder'
import { Mic, Edit, User } from 'lucide-react'

interface PersonWithReferrals extends Person {
  referralCount: number;
}

interface EditUserFormData {
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'active';
  occupation?: string;
  city?: string;
  state?: string;
  country?: string;
  meetingPlace?: string;
  gender?: string;
  birthdayText?: string;
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isLoading, isAdmin } = useAuth()
  const [users, setUsers] = useState<PersonWithReferrals[]>([])
  const [selectedUser, setSelectedUser] = useState<PersonWithReferrals | null>(null)
  const [newNote, setNewNote] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editUserOpen, setEditUserOpen] = useState(false)
  const [editUserData, setEditUserData] = useState<EditUserFormData>({
    name: '',
    email: '',
    phone: '',
    status: 'pending',
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAdmin = sessionStorage.getItem('admin') === 'true';
      if (!isAdmin) {
        router.push('/login');
      }
    }
  }, [router]);

  // Fetch users - no longer calculates referral counts
  const fetchUsers = async () => {
    try {
      setIsFetching(true)
      const q = query(
        collection(db, 'people'),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const usersData: PersonWithReferrals[] = []
      
      // Process user data with proper typings
      querySnapshot.docs.forEach(userDoc => {
        const userData = userDoc.data() as Person;
        
        usersData.push({
          id: userDoc.id,
          ...userData,
          // Use referralCount from Firestore if available, default to 0
          referralCount: userData.referralCount || 0,
          notes: []  // Notes will be loaded separately in a non-blocking way
        });
      });

      setUsers(usersData);
      
      // Fetch notes asynchronously (non-blocking)
      fetchUserNotes(usersData);
      
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error fetching users",
        description: "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsFetching(false)
    }
  }
  
  // Fetch notes for each user in a non-blocking way
  const fetchUserNotes = async (usersData: PersonWithReferrals[]) => {
    try {
      const updatedUsers = [...usersData];
      
      // Process each user's notes separately
      for (let i = 0; i < updatedUsers.length; i++) {
        const userId = updatedUsers[i].id;
        if (!userId) continue;
        
        const notesSnapshot = await getDocs(collection(db, 'people', userId, 'notes'));
        const notes = notesSnapshot.docs.map(noteDoc => ({
          id: noteDoc.id,
          content: String(noteDoc.data().content || ''),
          createdAt: noteDoc.data().createdAt as Timestamp,
          isFromVoice: noteDoc.data().isFromVoice as boolean | undefined,
          transcript: noteDoc.data().transcript as string | undefined,
          extractedData: noteDoc.data().extractedData as {
            occupation?: string;
            location?: string;
            meetingDetails?: string;
            otherInfo?: string;
            birthday?: string;
          } | undefined
        }));
        
        // Update this specific user's notes
        updatedUsers[i] = {
          ...updatedUsers[i],
          notes
        };
        
        // Update the state incrementally so the UI shows notes as they load
        setUsers([...updatedUsers]);
      }
      
    } catch (error) {
      console.error('Error fetching user notes:', error);
      // We don't show an error toast here since the main user data already loaded
    }
  }

  // Check if user is admin and fetch users
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/')
    } else if (isAdmin) {
      fetchUsers()
    }
  }, [isLoading, isAdmin, router])

  // Handle user activation
  const handleActivateUser = async (userId: string) => {
    try {
      setIsFetching(true)
      await updateDoc(doc(db, 'people', userId), {
        status: 'active'
      })
      
      toast({
        title: "User activated",
        description: "The user has been successfully activated."
      })

      // Refresh users list
      fetchUsers()
    } catch (error) {
      console.error('Error activating user:', error)
      toast({
        title: "Error activating user",
        description: "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsFetching(false)
    }
  }

  // Handle opening edit user dialog
  const handleEditUserClick = (userData: PersonWithReferrals) => {
    // Format birthday if it exists and is a Timestamp
    let birthdayText = '';
    if (userData.birthday && typeof userData.birthday.toDate === 'function') {
      const date = userData.birthday.toDate();
      birthdayText = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    } else if (userData.birthdayText) {
      birthdayText = userData.birthdayText;
    }

    setEditUserData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      status: userData.status || 'pending',
      occupation: userData.occupation || '',
      city: userData.city || '',
      state: userData.state || '',
      country: userData.country || '',
      meetingPlace: userData.meetingPlace || '',
      gender: userData.gender || '',
      birthdayText: birthdayText,
    });
    setSelectedUser(userData);
    setEditUserOpen(true);
  };

  // Handle saving user edits
  const handleSaveUserEdits = async () => {
    if (!selectedUser || !selectedUser.id) return;
    
    try {
      setIsUpdating(true);
      
      // Build update object
      const updateData: Record<string, any> = {
        name: editUserData.name,
        email: editUserData.email,
        phone: editUserData.phone,
        status: editUserData.status,
      };
      
      // Add optional fields if they have values
      if (editUserData.occupation) updateData.occupation = editUserData.occupation;
      if (editUserData.city) updateData.city = editUserData.city;
      if (editUserData.state) updateData.state = editUserData.state;
      if (editUserData.country) updateData.country = editUserData.country;
      if (editUserData.meetingPlace) updateData.meetingPlace = editUserData.meetingPlace;
      if (editUserData.gender) updateData.gender = editUserData.gender;
      
      // Handle birthday - try to convert to date if possible
      if (editUserData.birthdayText) {
        try {
          const birthdayDate = new Date(editUserData.birthdayText);
          if (!isNaN(birthdayDate.getTime())) {
            updateData.birthday = Timestamp.fromDate(birthdayDate);
            // Clean up birthdayText if we successfully parsed the date
            updateData.birthdayText = null;
          } else {
            // If not a valid date, store as text
            updateData.birthdayText = editUserData.birthdayText;
          }
        } catch (error) {
          console.error('Error parsing birthday:', error);
          updateData.birthdayText = editUserData.birthdayText;
        }
      }
      
      // Update in Firestore
      await updateDoc(doc(db, 'people', selectedUser.id), updateData);
      
      toast({
        title: "User updated",
        description: "User information has been successfully updated.",
      });
      
      // Close dialog and refresh
      setEditUserOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error updating user",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle adding a note
  const handleAddNote = async () => {
    if (!selectedUser || !selectedUser.id || !newNote.trim()) return

    try {
      setIsFetching(true)
      await addDoc(collection(db, 'people', selectedUser.id, 'notes'), {
        content: newNote,
        createdAt: Timestamp.now()
      })

      setNewNote('')
      toast({
        title: "Note added",
        description: "Your note has been saved successfully."
      })

      // Refresh users list to show new note
      fetchUsers()
    } catch (error) {
      console.error('Error adding note:', error)
      toast({
        title: "Error adding note",
        description: "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsFetching(false)
    }
  }

  // Handle voice note added
  const handleVoiceNoteAdded = () => {
    // Refresh users list to show new note
    fetchUsers()
  }

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white/70">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        
        <div className="grid gap-6">
          {users.map(user => (
            <Card key={user.id} className="p-6 bg-white/10 backdrop-blur border-white/20">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                  <div className="space-y-1 text-white/70">
                    <p>Email: {user.email}</p>
                    <p>Phone: {user.phone}</p>
                    <p>Status: <span className="capitalize">{user.status || 'pending'}</span></p>
                    <p>Created: {user.createdAt?.toDate().toLocaleDateString()}</p>
                    <p>Invited: <span className="font-semibold text-emerald-400">{user.referralCount} {user.referralCount === 1 ? 'person' : 'people'}</span></p>
                    
                    {/* Display additional CRM fields if available */}
                    {user.occupation && (
                      <p>Occupation: {user.occupation}</p>
                    )}
                    {user.meetingPlace && (
                      <p>Meeting Place: {user.meetingPlace}</p>
                    )}
                    {user.city && (
                      <p>City: {user.city}</p>
                    )}
                    {user.state && (
                      <p>State: {user.state}</p>
                    )}
                    {user.country && (
                      <p>Country: {user.country}</p>
                    )}
                    {user.gender && (
                      <p>Gender: {user.gender}</p>
                    )}
                    {user.birthday && typeof user.birthday.toDate === 'function' && (
                      <p>Birthday: {user.birthday.toDate().toLocaleDateString()}</p>
                    )}
                    {user.birthdayText && !user.birthday && (
                      <p>Birthday: {user.birthdayText}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {user.status !== 'active' && (
                    <Button
                      onClick={() => handleActivateUser(user.id || '')}
                      disabled={isFetching}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      Activate User
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => handleEditUserClick(user)}
                    className="border-white/20 hover:bg-white/10 flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit User
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-white/20 hover:bg-white/10 flex items-center gap-2"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Mic className="h-4 w-4" />
                        Manage Notes ({user.notes?.length || 0})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-background/95 backdrop-blur border-white/20 max-h-[85vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Notes for {user.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 overflow-y-auto pr-2 flex-1">
                        {/* Text Note Input */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Add Text Note</h3>
                          <Textarea
                            placeholder="Add a new text note..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="min-h-[100px] bg-background/5"
                          />
                          <Button
                            onClick={handleAddNote}
                            disabled={isFetching || !newNote.trim()}
                            className="w-full bg-emerald-500 hover:bg-emerald-600"
                          >
                            Add Text Note
                          </Button>
                        </div>
                        
                        {/* Voice Note Recorder */}
                        <div className="space-y-2 border-t border-white/10 pt-4">
                          <h3 className="text-sm font-medium">Record Voice Note</h3>
                          {user.id && (
                            <VoiceRecorder 
                              personId={user.id}
                              onNoteAdded={handleVoiceNoteAdded}
                            />
                          )}
                        </div>

                        {/* Notes List */}
                        <div className="space-y-3 border-t border-white/10 pt-4">
                          <h3 className="text-sm font-medium">Previous Notes</h3>
                          {user.notes && user.notes.length > 0 ? (
                            user.notes.map(note => (
                              <div
                                key={note.id}
                                className="p-3 rounded bg-white/5 space-y-1"
                              >
                                <p className="text-sm text-white/90">{note.content}</p>
                                {note.isFromVoice && note.extractedData && (
                                  <div className="mt-2 border-t border-white/10 pt-2 text-xs text-white/70">
                                    <p className="italic">Extracted information:</p>
                                    {note.extractedData.occupation && (
                                      <p>Occupation: {note.extractedData.occupation}</p>
                                    )}
                                    {note.extractedData.location && (
                                      <p>Location: {note.extractedData.location}</p>
                                    )}
                                    {note.extractedData.meetingDetails && (
                                      <p>Meeting: {note.extractedData.meetingDetails}</p>
                                    )}
                                    {note.extractedData.birthday && (
                                      <p>Birthday: {note.extractedData.birthday}</p>
                                    )}
                                    {note.extractedData.otherInfo && (
                                      <p>Other: {note.extractedData.otherInfo}</p>
                                    )}
                                  </div>
                                )}
                                <p className="text-xs text-white/50">
                                  {note.createdAt.toDate().toLocaleString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-white/50">No notes yet</p>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog 
        open={editUserOpen} 
        onOpenChange={(open) => {
          setEditUserOpen(open);
          if (!open) setSelectedUser(null);
        }}
      >
        <DialogContent className="bg-background/95 backdrop-blur border-white/20 max-w-md max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Edit User: {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 overflow-y-auto pr-2 flex-1">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editUserData.name}
                onChange={(e) => setEditUserData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-background/5"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editUserData.email}
                onChange={(e) => setEditUserData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-background/5"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editUserData.phone}
                onChange={(e) => setEditUserData(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-background/5"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={editUserData.status}
                onChange={(e) => setEditUserData(prev => ({ 
                  ...prev, 
                  status: e.target.value as 'pending' | 'active' 
                }))}
                className="rounded-md h-10 px-3 py-2 bg-background/5 border border-white/20"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
              </select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={editUserData.occupation || ''}
                onChange={(e) => setEditUserData(prev => ({ ...prev, occupation: e.target.value }))}
                className="bg-background/5"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={editUserData.city || ''}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, city: e.target.value }))}
                  className="bg-background/5"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={editUserData.state || ''}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, state: e.target.value }))}
                  className="bg-background/5"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={editUserData.country || ''}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, country: e.target.value }))}
                  className="bg-background/5"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={editUserData.gender || ''}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, gender: e.target.value }))}
                  className="bg-background/5"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="meetingPlace">Meeting Place</Label>
              <Input
                id="meetingPlace"
                value={editUserData.meetingPlace || ''}
                onChange={(e) => setEditUserData(prev => ({ ...prev, meetingPlace: e.target.value }))}
                className="bg-background/5"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="birthday">Birthday (YYYY-MM-DD)</Label>
              <Input
                id="birthday"
                value={editUserData.birthdayText || ''}
                onChange={(e) => setEditUserData(prev => ({ ...prev, birthdayText: e.target.value }))}
                placeholder="YYYY-MM-DD"
                className="bg-background/5"
              />
            </div>
          </div>
          
          <DialogFooter className="flex-shrink-0 pt-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setEditUserOpen(false)}
              className="border-white/20"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveUserEdits}
              disabled={isUpdating}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 