llex items-center space-x-1">  
          <span>📍</span>  
          <span>Nigeria</span>  
        </div>  
        <div className="flex items-center space-x-1">  
          <span>🔗</span>  
          <span>{userLinks.length} links</span>  
        </div>  
        {userProducts.length > 0 && (  
          <div className="flex items-center space-x-1">  
            <span>🛍️</span>  
            <span>{userProducts.length} products</span>  
          </div>  
        )}  
      </div>  
    </div>  

    {userProducts.length > 0 && (  
      <>  
        <div className="mb-4">  
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">  
            <DollarSign className="w-5 h-5 text-green-500 mr-2" />  
            Digital Products & Services  
          </h2>  
        </div>  

        <div className="mb-8 space-y-3">  
          {userProducts.map((product) => (  
            <div  
              key={product.id}  
              className="w-full bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/60 shadow-sm"  
            >  
              <div className="flex items-start gap-4">  
                <button  
                  type="button"  
                  onClick={() =>  
                    product.imageUrl &&  
                    openImagePreview(product.imageUrl, product.name)  
                  }  
                  className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border hover:opacity-90 transition"  
                >  
                  {product.imageUrl ? (  
                    <img  
                      src={product.imageUrl}  
                      alt={product.name}  
                      className="w-full h-full object-cover"  
                    />  
                  ) : (  
                    <div className="w-full h-full flex items-center justify-center bg-green-50">  
                      <ImageIcon className="w-6 h-6 text-green-500" />  
                    </div>  
                  )}  
                </button>  

                <div  
                  className="flex-1 min-w-0 cursor-pointer"  
                  onClick={() => handleProductClick(product)}  
                >  
                  <div className="flex items-start justify-between gap-3">  
                    <div className="min-w-0">  
                      <h3 className="font-semibold text-gray-900 truncate">  
                        {product.name}  
                      </h3>  
                      <div className="flex items-center gap-2 mt-1">  
                        <span className="text-green-600 font-bold text-lg">  
                          ₦  
                          {parseInt(  
                            product.price || 0,  
                            10  
                          ).toLocaleString()}  
                        </span>  
                        <span className="text-xs text-gray-400 capitalize">  
                          {product.type}  
                        </span>  
                      </div>  
                    </div>  

                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">  
                      {getProductTypeIcon(product.type)}  
                    </div>  
                  </div>  

                  {product.description && (  
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">  
                      {product.description}  
                    </p>  
                  )}  

                  <div className="mt-3 flex justify-between items-center">  
                    <span className="text-xs text-gray-400">  
                      Tap to open product  
                    </span>  
                    <ExternalLink className="w-4 h-4 text-gray-400" />  
                  </div>  
                </div>  
              </div>  
            </div>  
          ))}  
        </div>  
      </>  
    )}  

    {userLinks.length > 0 ? (  
      <div className="space-y-3 mb-8">  
        {userLinks.map((link, index) => (  
          <button  
            key={link.id}  
            onClick={() => handleLinkClick(link)}  
            className={`w-full p-4 bg-gradient-to-r ${getLinkColor(  
              link.type,  
              index  
            )} text-white rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-between group`}  
          >  
            <div className="flex items-center space-x-4">  
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">  
                {getLinkTypeIcon(link.type)}  
              </div>  
              <div className="text-left">  
                <div className="font-semibold">{link.title}</div>  
                <div className="text-sm opacity-75">  
                  {link.clicks || 0} clicks  
                </div>  
              </div>  
            </div>  
            <ExternalLink className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />  
          </button>  
        ))}  
      </div>  
    ) : (  
      <div className="text-center py-12">  
        <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">  
          <Globe className="w-8 h-8 text-gray-400" />  
        </div>  
        <h3 className="text-lg font-medium text-gray-900 mb-2">  
          No Links Yet  
        </h3>  
        <p className="text-gray-600 mb-6">  
          This user hasn't added any links to their profile yet.  
        </p>  
      </div>  
    )}  

    {!isOwnProfile && (  
      <div className="text-center pt-8 border-t border-white/30">  
        <p className="text-gray-500 text-sm mb-4">  
          Create your own link-in-bio page  
        </p>  
        <button  
          onClick={() => navigate("/signup")}  
          className="bg-gradient-to-r from-orange-600 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"  
        >  
          Create Your LinkAfrika Page  
        </button>  
      </div>  
    )}  
  </div>  

  {previewImage && (  
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">  
      <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">  
        <div className="flex items-center justify-between px-4 py-3 border-b">  
          <h3 className="font-semibold text-gray-900 truncate">  
            {previewTitle}  
          </h3>  
          <button  
            onClick={closeImagePreview}  
            className="p-2 rounded-lg hover:bg-gray-100 transition"  
          >  
            <X className="w-5 h-5 text-gray-600" />  
          </button>  
        </div>  

        <div className="bg-gray-50 flex items-center justify-center p-4">  
          <img  
            src={previewImage}  
            alt={previewTitle}  
            className="max-h-[70vh] w-auto object-contain rounded-xl"  
          />  
        </div>  
      </div>  
    </div>  
  )}  
</div>

);
};

export default UserProfile;
