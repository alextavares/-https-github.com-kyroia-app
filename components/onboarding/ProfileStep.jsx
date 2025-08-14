"use client";
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload } from 'lucide-react';
export default function ProfileStep({ profileData, onUpdate }) {
    const [formData, setFormData] = useState(profileData);
    const [imagePreview, setImagePreview] = useState(null);
    // Use ref to hold last propagated value to avoid parent-child update loops
    const lastSentRef = useRef(formData);
    // Propagate to parent only when there is a meaningful change and it differs from last sent
    useEffect(() => {
        const changed = JSON.stringify(formData) !== JSON.stringify(lastSentRef.current);
        if (changed) {
            onUpdate(formData);
            lastSentRef.current = formData;
        }
        // Depend on formData and onUpdate; JSON compare prevents loops
    }, [formData, onUpdate]);
    // Sync from parent props into local state only when actually different
    useEffect(() => {
        const differs = JSON.stringify(profileData) !== JSON.stringify(formData);
        if (differs) {
            setFormData(profileData);
            // also align lastSentRef so next local effect won't re-send same data
            lastSentRef.current = profileData;
        }
    }, [profileData, formData]);
    const handleInputChange = (field, value) => {
        setFormData(prev => {
            const next = Object.assign(Object.assign({}, prev), { [field]: value });
            return next;
        });
    };
    const handleImageUpload = (event) => {
        var _a;
        const file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                var _a;
                const imageUrl = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
                setImagePreview(imageUrl);
                setFormData(prev => {
                    const next = Object.assign(Object.assign({}, prev), { profileImage: imageUrl });
                    return next;
                });
            };
            reader.readAsDataURL(file);
        }
    };
    const getInitials = () => {
        return `${formData.name.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
    };
    return (<div className="space-y-6">
      {/* Profile Picture */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={imagePreview || formData.profileImage}/>
            <AvatarFallback className="bg-primary text-white text-xl">
              {getInitials() || '?'}
            </AvatarFallback>
          </Avatar>
          
          <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0" onClick={() => { var _a; return (_a = document.getElementById('profile-image')) === null || _a === void 0 ? void 0 : _a.click(); }}>
            <Camera className="w-4 h-4"/>
          </Button>
          
          <input id="profile-image" type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>
        </div>
        
        <Button variant="ghost" size="sm" className="text-primary">
          <Upload className="w-4 h-4 mr-2"/>
          Escolher Foto
        </Button>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Alexandre"/>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Sobrenome</Label>
          <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} placeholder="Tavares"/>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="organization">Organização</Label>
        <Input id="organization" value={formData.organization} onChange={(e) => handleInputChange('organization', e.target.value)} placeholder="Organização Pessoal"/>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Número de Telefone</Label>
        <div className="flex">
          <div className="flex items-center px-3 border border-r-0 border-input bg-muted rounded-l-md">
            <span className="text-2xl mr-2">🇧🇷</span>
            <span className="text-sm text-muted-foreground">+55</span>
          </div>
          <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="11 96123-4567" className="rounded-l-none"/>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZmlsZVN0ZXAuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUHJvZmlsZVN0ZXAudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTtBQUVaLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUNuRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDL0MsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQzdDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUM3QyxPQUFPLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUM1RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQWM3QyxNQUFNLENBQUMsT0FBTyxVQUFVLFdBQVcsQ0FBQyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQW9CO0lBQzdFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQ3JELE1BQU0sQ0FBQyxZQUFZLEVBQUUsZUFBZSxDQUFDLEdBQUcsUUFBUSxDQUFnQixJQUFJLENBQUMsQ0FBQTtJQUVyRSwyRUFBMkU7SUFDM0UsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFrQixRQUFRLENBQUMsQ0FBQTtJQUVyRCwyRkFBMkY7SUFDM0YsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUNiLE1BQU0sT0FBTyxHQUNYLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDbEUsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNaLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUNsQixXQUFXLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQTtRQUNoQyxDQUFDO1FBQ0QsK0RBQStEO0lBQ2pFLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFBO0lBRXhCLHVFQUF1RTtJQUN2RSxTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ2IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3hFLElBQUksT0FBTyxFQUFFLENBQUM7WUFDWixXQUFXLENBQUMsV0FBVyxDQUFDLENBQUE7WUFDeEIsc0VBQXNFO1lBQ3RFLFdBQVcsQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFBO1FBQ25DLENBQUM7SUFDSCxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQTtJQUUzQixNQUFNLGlCQUFpQixHQUFHLENBQUMsS0FBYSxFQUFFLEtBQWEsRUFBRSxFQUFFO1FBQ3pELFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNqQixNQUFNLElBQUksbUNBQVEsSUFBSSxLQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxHQUFFLENBQUE7WUFDeEMsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUMsQ0FBQTtJQUVELE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxLQUEwQyxFQUFFLEVBQUU7O1FBQ3ZFLE1BQU0sSUFBSSxHQUFHLE1BQUEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLDBDQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ3BDLElBQUksSUFBSSxFQUFFLENBQUM7WUFDVCxNQUFNLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFBO1lBQy9CLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRTs7Z0JBQ3BCLE1BQU0sUUFBUSxHQUFHLE1BQUEsQ0FBQyxDQUFDLE1BQU0sMENBQUUsTUFBZ0IsQ0FBQTtnQkFDM0MsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFBO2dCQUN6QixXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ2pCLE1BQU0sSUFBSSxtQ0FBUSxJQUFJLEtBQUUsWUFBWSxFQUFFLFFBQVEsR0FBRSxDQUFBO29CQUNoRCxPQUFPLElBQUksQ0FBQTtnQkFDYixDQUFDLENBQUMsQ0FBQTtZQUNKLENBQUMsQ0FBQTtZQUNELE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDNUIsQ0FBQztJQUNILENBQUMsQ0FBQTtJQUVELE1BQU0sV0FBVyxHQUFHLEdBQUcsRUFBRTtRQUN2QixPQUFPLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNqRixDQUFDLENBQUE7SUFFRCxPQUFPLENBQ0wsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FDeEI7TUFBQSxDQUFDLHFCQUFxQixDQUN0QjtNQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxzQ0FBc0MsQ0FDbkQ7UUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUN2QjtVQUFBLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQzNCO1lBQUEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsWUFBWSxJQUFJLFFBQVEsQ0FBQyxZQUFZLENBQUMsRUFDeEQ7WUFBQSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsK0JBQStCLENBQ3ZEO2NBQUEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxHQUFHLENBQ3ZCO1lBQUEsRUFBRSxjQUFjLENBQ2xCO1VBQUEsRUFBRSxNQUFNLENBRVI7O1VBQUEsQ0FBQyxNQUFNLENBQ0wsSUFBSSxDQUFDLElBQUksQ0FDVCxPQUFPLENBQUMsU0FBUyxDQUNqQixTQUFTLENBQUMsc0RBQXNELENBQ2hFLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxXQUFDLE9BQUEsTUFBQSxRQUFRLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQywwQ0FBRSxLQUFLLEVBQUUsQ0FBQSxFQUFBLENBQUMsQ0FFakU7WUFBQSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUM3QjtVQUFBLEVBQUUsTUFBTSxDQUVSOztVQUFBLENBQUMsS0FBSyxDQUNKLEVBQUUsQ0FBQyxlQUFlLENBQ2xCLElBQUksQ0FBQyxNQUFNLENBQ1gsTUFBTSxDQUFDLFNBQVMsQ0FDaEIsUUFBUSxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FDNUIsU0FBUyxDQUFDLFFBQVEsRUFFdEI7UUFBQSxFQUFFLEdBQUcsQ0FFTDs7UUFBQSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FDeEQ7VUFBQSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUNoQzs7UUFDRixFQUFFLE1BQU0sQ0FDVjtNQUFBLEVBQUUsR0FBRyxDQUVMOztNQUFBLENBQUMsaUJBQWlCLENBQ2xCO01BQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLHdCQUF3QixDQUNyQztRQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQ3hCO1VBQUEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUNqQztVQUFBLENBQUMsS0FBSyxDQUNKLEVBQUUsQ0FBQyxNQUFNLENBQ1QsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUNyQixRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDM0QsV0FBVyxDQUFDLFdBQVcsRUFFM0I7UUFBQSxFQUFFLEdBQUcsQ0FFTDs7UUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUN4QjtVQUFBLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FDMUM7VUFBQSxDQUFDLEtBQUssQ0FDSixFQUFFLENBQUMsVUFBVSxDQUNiLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FDekIsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQy9ELFdBQVcsQ0FBQyxTQUFTLEVBRXpCO1FBQUEsRUFBRSxHQUFHLENBQ1A7TUFBQSxFQUFFLEdBQUcsQ0FFTDs7TUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUN4QjtRQUFBLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FDaEQ7UUFBQSxDQUFDLEtBQUssQ0FDSixFQUFFLENBQUMsY0FBYyxDQUNqQixLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQzdCLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUNuRSxXQUFXLENBQUMscUJBQXFCLEVBRXJDO01BQUEsRUFBRSxHQUFHLENBRUw7O01BQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FDeEI7UUFBQSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLEtBQUssQ0FDaEQ7UUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUNuQjtVQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyw2RUFBNkUsQ0FDMUY7WUFBQSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQzFDO1lBQUEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLCtCQUErQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQzNEO1VBQUEsRUFBRSxHQUFHLENBQ0w7VUFBQSxDQUFDLEtBQUssQ0FDSixFQUFFLENBQUMsT0FBTyxDQUNWLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FDdEIsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQzVELFdBQVcsQ0FBQyxlQUFlLENBQzNCLFNBQVMsQ0FBQyxnQkFBZ0IsRUFFOUI7UUFBQSxFQUFFLEdBQUcsQ0FDUDtNQUFBLEVBQUUsR0FBRyxDQUNQO0lBQUEsRUFBRSxHQUFHLENBQUMsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyJ9