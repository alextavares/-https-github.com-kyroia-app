'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
const categories = [
    'TRABALHO',
    'MARKETING',
    'DESIGN',
    'VENDAS',
    'OPERACOES',
    'FINANCAS',
    'ENGENHARIA',
    'CRIADOR_CONTEUDO',
    'RECURSOS_HUMANOS'
];
export default function TemplateSelector({ onUseTemplate, onClose }) {
    var _a;
    const [templates, setTemplates] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [variableValues, setVariableValues] = useState({});
    useEffect(() => {
        fetchTemplates();
    }, [selectedCategory]);
    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const url = selectedCategory
                ? `/api/templates?category=${selectedCategory}`
                : '/api/templates';
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            }
        }
        catch (error) {
            console.error('Error fetching templates:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleUseTemplate = async (template) => {
        try {
            // Track usage
            await fetch(`/api/templates/${template.id}/use`, {
                method: 'POST'
            });
            if (template.variables && template.variables.length > 0) {
                setSelectedTemplate(template);
                // Initialize variable values
                const initialValues = {};
                template.variables.forEach(variable => {
                    initialValues[variable] = '';
                });
                setVariableValues(initialValues);
            }
            else {
                onUseTemplate(template.templateContent);
                onClose();
            }
        }
        catch (error) {
            console.error('Error using template:', error);
            // Still allow using the template even if tracking fails
            onUseTemplate(template.templateContent);
            onClose();
        }
    };
    const handleVariableTemplate = () => {
        if (!selectedTemplate)
            return;
        let content = selectedTemplate.templateContent;
        Object.entries(variableValues).forEach(([variable, value]) => {
            content = content.replace(new RegExp(`\\{${variable}\\}`, 'g'), value);
        });
        onUseTemplate(content);
        onClose();
    };
    const formatCategoryName = (category) => {
        return category.replace('_', ' ').toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };
    if (selectedTemplate) {
        return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
              <Button variant="outline" size="sm" onClick={() => setSelectedTemplate(null)}>
                ← Voltar
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Preencha as variáveis abaixo:
              </p>
              
              {(_a = selectedTemplate.variables) === null || _a === void 0 ? void 0 : _a.map((variable) => (<div key={variable} className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    {variable}
                  </label>
                  <input type="text" value={variableValues[variable] || ''} onChange={(e) => setVariableValues(prev => (Object.assign(Object.assign({}, prev), { [variable]: e.target.value })))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" placeholder={`Digite ${variable}...`}/>
                </div>))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Preview:</label>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-sm">
                {(() => {
                let preview = selectedTemplate.templateContent;
                Object.entries(variableValues).forEach(([variable, value]) => {
                    preview = preview.replace(new RegExp(`\\{${variable}\\}`, 'g'), value || `{${variable}}`);
                });
                return preview;
            })()}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleVariableTemplate} className="flex-1">
                Usar Template
              </Button>
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>);
    }
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Templates de Prompts</h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕ Fechar
            </Button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <Button variant={selectedCategory === null ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(null)}>
                Todos
              </Button>
              {categories.map((category) => (<Button key={category} variant={selectedCategory === category ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(category)}>
                  {formatCategoryName(category)}
                </Button>))}
            </div>
          </div>

          {/* Templates Grid */}
          {loading ? (<div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (<div key={template.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleUseTemplate(template)}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm">{template.name}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {formatCategoryName(template.category)}
                    </span>
                  </div>
                  
                  {template.description && (<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {template.description}
                    </p>)}
                  
                  <div className="text-xs text-gray-500 mb-2">
                    {template.templateContent.substring(0, 100)}...
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Usado {template.usageCount} vezes</span>
                    {template.variables && template.variables.length > 0 && (<span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {template.variables.length} variáveis
                      </span>)}
                  </div>
                </div>))}

              {templates.length === 0 && (<div className="col-span-full text-center py-8 text-gray-500">
                  Nenhum template encontrado nesta categoria.
                </div>)}
            </div>)}
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUtc2VsZWN0b3IuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidGVtcGxhdGUtc2VsZWN0b3IudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTtBQUVaLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sT0FBTyxDQUFBO0FBQzNDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQXFCL0MsTUFBTSxVQUFVLEdBQUc7SUFDakIsVUFBVTtJQUNWLFdBQVc7SUFDWCxRQUFRO0lBQ1IsUUFBUTtJQUNSLFdBQVc7SUFDWCxVQUFVO0lBQ1YsWUFBWTtJQUNaLGtCQUFrQjtJQUNsQixrQkFBa0I7Q0FDbkIsQ0FBQTtBQUVELE1BQU0sQ0FBQyxPQUFPLFVBQVUsZ0JBQWdCLENBQUMsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUF5Qjs7SUFDeEYsTUFBTSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsR0FBRyxRQUFRLENBQWEsRUFBRSxDQUFDLENBQUE7SUFDMUQsTUFBTSxDQUFDLGdCQUFnQixFQUFFLG1CQUFtQixDQUFDLEdBQUcsUUFBUSxDQUFnQixJQUFJLENBQUMsQ0FBQTtJQUM3RSxNQUFNLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM1QyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsbUJBQW1CLENBQUMsR0FBRyxRQUFRLENBQWtCLElBQUksQ0FBQyxDQUFBO0lBQy9FLE1BQU0sQ0FBQyxjQUFjLEVBQUUsaUJBQWlCLENBQUMsR0FBRyxRQUFRLENBQXlCLEVBQUUsQ0FBQyxDQUFBO0lBRWhGLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDYixjQUFjLEVBQUUsQ0FBQTtJQUNsQixDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUE7SUFFdEIsTUFBTSxjQUFjLEdBQUcsS0FBSyxJQUFJLEVBQUU7UUFDaEMsSUFBSSxDQUFDO1lBQ0gsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ2hCLE1BQU0sR0FBRyxHQUFHLGdCQUFnQjtnQkFDMUIsQ0FBQyxDQUFDLDJCQUEyQixnQkFBZ0IsRUFBRTtnQkFDL0MsQ0FBQyxDQUFDLGdCQUFnQixDQUFBO1lBRXBCLE1BQU0sUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ2pDLElBQUksUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNoQixNQUFNLElBQUksR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtnQkFDbEMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ3BCLENBQUM7UUFDSCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDbkQsQ0FBQztnQkFBUyxDQUFDO1lBQ1QsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ25CLENBQUM7SUFDSCxDQUFDLENBQUE7SUFFRCxNQUFNLGlCQUFpQixHQUFHLEtBQUssRUFBRSxRQUFrQixFQUFFLEVBQUU7UUFDckQsSUFBSSxDQUFDO1lBQ0gsY0FBYztZQUNkLE1BQU0sS0FBSyxDQUFDLGtCQUFrQixRQUFRLENBQUMsRUFBRSxNQUFNLEVBQUU7Z0JBQy9DLE1BQU0sRUFBRSxNQUFNO2FBQ2YsQ0FBQyxDQUFBO1lBRUYsSUFBSSxRQUFRLENBQUMsU0FBUyxJQUFJLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUN4RCxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQTtnQkFDN0IsNkJBQTZCO2dCQUM3QixNQUFNLGFBQWEsR0FBMkIsRUFBRSxDQUFBO2dCQUNoRCxRQUFRLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDcEMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtnQkFDOUIsQ0FBQyxDQUFDLENBQUE7Z0JBQ0YsaUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUE7WUFDbEMsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLGFBQWEsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUE7Z0JBQ3ZDLE9BQU8sRUFBRSxDQUFBO1lBQ1gsQ0FBQztRQUNILENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxLQUFLLENBQUMsQ0FBQTtZQUM3Qyx3REFBd0Q7WUFDeEQsYUFBYSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQTtZQUN2QyxPQUFPLEVBQUUsQ0FBQTtRQUNYLENBQUM7SUFDSCxDQUFDLENBQUE7SUFFRCxNQUFNLHNCQUFzQixHQUFHLEdBQUcsRUFBRTtRQUNsQyxJQUFJLENBQUMsZ0JBQWdCO1lBQUUsT0FBTTtRQUU3QixJQUFJLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUE7UUFDOUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFO1lBQzNELE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sUUFBUSxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDeEUsQ0FBQyxDQUFDLENBQUE7UUFFRixhQUFhLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDdEIsT0FBTyxFQUFFLENBQUE7SUFDWCxDQUFDLENBQUE7SUFFRCxNQUFNLGtCQUFrQixHQUFHLENBQUMsUUFBZ0IsRUFBRSxFQUFFO1FBQzlDLE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFO2FBQzVDLEtBQUssQ0FBQyxHQUFHLENBQUM7YUFDVixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDekQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ2QsQ0FBQyxDQUFBO0lBRUQsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3JCLE9BQU8sQ0FDTCxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsNEVBQTRFLENBQ3pGO1FBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLHlGQUF5RixDQUN0RztVQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQ2xCO1lBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLHdDQUF3QyxDQUNyRDtjQUFBLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FDakU7Y0FBQSxDQUFDLE1BQU0sQ0FDTCxPQUFPLENBQUMsU0FBUyxDQUNqQixJQUFJLENBQUMsSUFBSSxDQUNULE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBRXpDOztjQUNGLEVBQUUsTUFBTSxDQUNWO1lBQUEsRUFBRSxHQUFHLENBRUw7O1lBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FDbkI7Y0FBQSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsK0NBQStDLENBQzFEOztjQUNGLEVBQUUsQ0FBQyxDQUVIOztjQUFBLENBQUMsTUFBQSxnQkFBZ0IsQ0FBQyxTQUFTLDBDQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FDN0MsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FDbEM7a0JBQUEsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLGdDQUFnQyxDQUMvQztvQkFBQSxDQUFDLFFBQVEsQ0FDWDtrQkFBQSxFQUFFLEtBQUssQ0FDUDtrQkFBQSxDQUFDLEtBQUssQ0FDSixJQUFJLENBQUMsTUFBTSxDQUNYLEtBQUssQ0FBQyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FDdEMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsaUNBQ3RDLElBQUksS0FDUCxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUMxQixDQUFDLENBQUMsQ0FDSixTQUFTLENBQUMsbUdBQW1HLENBQzdHLFdBQVcsQ0FBQyxDQUFDLFVBQVUsUUFBUSxLQUFLLENBQUMsRUFFekM7Z0JBQUEsRUFBRSxHQUFHLENBQUMsQ0FDUCxDQUFDLENBQ0o7WUFBQSxFQUFFLEdBQUcsQ0FFTDs7WUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUNuQjtjQUFBLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxnQ0FBZ0MsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUNqRTtjQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxvREFBb0QsQ0FDakU7Z0JBQUEsQ0FBQyxDQUFDLEdBQUcsRUFBRTtnQkFDTCxJQUFJLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUE7Z0JBQzlDLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRTtvQkFDM0QsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQ3ZCLElBQUksTUFBTSxDQUFDLE1BQU0sUUFBUSxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQ3BDLEtBQUssSUFBSSxJQUFJLFFBQVEsR0FBRyxDQUN6QixDQUFBO2dCQUNILENBQUMsQ0FBQyxDQUFBO2dCQUNGLE9BQU8sT0FBTyxDQUFBO1lBQ2hCLENBQUMsQ0FBQyxFQUFFLENBQ047Y0FBQSxFQUFFLEdBQUcsQ0FDUDtZQUFBLEVBQUUsR0FBRyxDQUVMOztZQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQ3pCO2NBQUEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUN6RDs7Y0FDRixFQUFFLE1BQU0sQ0FDUjtjQUFBLENBQUMsTUFBTSxDQUNMLE9BQU8sQ0FBQyxTQUFTLENBQ2pCLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBRXpDOztjQUNGLEVBQUUsTUFBTSxDQUNWO1lBQUEsRUFBRSxHQUFHLENBQ1A7VUFBQSxFQUFFLEdBQUcsQ0FDUDtRQUFBLEVBQUUsR0FBRyxDQUNQO01BQUEsRUFBRSxHQUFHLENBQUMsQ0FDUCxDQUFBO0lBQ0gsQ0FBQztJQUVELE9BQU8sQ0FDTCxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsNEVBQTRFLENBQ3pGO01BQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLHlGQUF5RixDQUN0RztRQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQ2xCO1VBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLHdDQUF3QyxDQUNyRDtZQUFBLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQzlEO1lBQUEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUNuRDs7WUFDRixFQUFFLE1BQU0sQ0FDVjtVQUFBLEVBQUUsR0FBRyxDQUVMOztVQUFBLENBQUMsZ0JBQWdCLENBQ2pCO1VBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FDbkI7WUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQ25DO2NBQUEsQ0FBQyxNQUFNLENBQ0wsT0FBTyxDQUFDLENBQUMsZ0JBQWdCLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUMzRCxJQUFJLENBQUMsSUFBSSxDQUNULE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBRXpDOztjQUNGLEVBQUUsTUFBTSxDQUNSO2NBQUEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUM1QixDQUFDLE1BQU0sQ0FDTCxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FDZCxPQUFPLENBQUMsQ0FBQyxnQkFBZ0IsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQy9ELElBQUksQ0FBQyxJQUFJLENBQ1QsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FFN0M7a0JBQUEsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FDL0I7Z0JBQUEsRUFBRSxNQUFNLENBQUMsQ0FDVixDQUFDLENBQ0o7WUFBQSxFQUFFLEdBQUcsQ0FDUDtVQUFBLEVBQUUsR0FBRyxDQUVMOztVQUFBLENBQUMsb0JBQW9CLENBQ3JCO1VBQUEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQ1QsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLDBCQUEwQixDQUN2QztjQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyw4REFBOEQsQ0FBQyxFQUFFLEdBQUcsQ0FDckY7WUFBQSxFQUFFLEdBQUcsQ0FBQyxDQUNQLENBQUMsQ0FBQyxDQUFDLENBQ0YsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLHVDQUF1QyxDQUNwRDtjQUFBLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FDM0IsQ0FBQyxHQUFHLENBQ0YsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUNqQixTQUFTLENBQUMsNkdBQTZHLENBQ3ZILE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBRTNDO2tCQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyx1Q0FBdUMsQ0FDcEQ7b0JBQUEsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FDdkQ7b0JBQUEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHNFQUFzRSxDQUNwRjtzQkFBQSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FDeEM7b0JBQUEsRUFBRSxJQUFJLENBQ1I7a0JBQUEsRUFBRSxHQUFHLENBRUw7O2tCQUFBLENBQUMsUUFBUSxDQUFDLFdBQVcsSUFBSSxDQUN2QixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsK0NBQStDLENBQzFEO3NCQUFBLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FDdkI7b0JBQUEsRUFBRSxDQUFDLENBQUMsQ0FDTCxDQUVEOztrQkFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsNEJBQTRCLENBQ3pDO29CQUFBLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2tCQUM5QyxFQUFFLEdBQUcsQ0FFTDs7a0JBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLHlEQUF5RCxDQUN0RTtvQkFBQSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBRSxNQUFLLEVBQUUsSUFBSSxDQUM3QztvQkFBQSxDQUFDLFFBQVEsQ0FBQyxTQUFTLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQ3RELENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpRkFBaUYsQ0FDL0Y7d0JBQUEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBRTtzQkFDOUIsRUFBRSxJQUFJLENBQUMsQ0FDUixDQUNIO2tCQUFBLEVBQUUsR0FBRyxDQUNQO2dCQUFBLEVBQUUsR0FBRyxDQUFDLENBQ1AsQ0FBQyxDQUVGOztjQUFBLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FDekIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLDhDQUE4QyxDQUMzRDs7Z0JBQ0YsRUFBRSxHQUFHLENBQUMsQ0FDUCxDQUNIO1lBQUEsRUFBRSxHQUFHLENBQUMsQ0FDUCxDQUNIO1FBQUEsRUFBRSxHQUFHLENBQ1A7TUFBQSxFQUFFLEdBQUcsQ0FDUDtJQUFBLEVBQUUsR0FBRyxDQUFDLENBQ1AsQ0FBQTtBQUNILENBQUMifQ==